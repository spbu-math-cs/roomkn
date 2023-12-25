package org.tod87et.roomkn.server.routing

import io.ktor.http.HttpStatusCode
import io.ktor.http.headers
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.principal
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.put
import io.ktor.server.routing.route
import io.ktor.util.logging.KtorSimpleLogger
import io.ktor.util.pipeline.PipelineContext
import kotlinx.datetime.Clock
import kotlinx.datetime.Instant
import org.jetbrains.exposed.sql.SortOrder
import org.koin.ktor.ext.inject
import org.tod87et.roomkn.server.auth.AuthSession
import org.tod87et.roomkn.server.auth.AuthenticationProvider
import org.tod87et.roomkn.server.auth.userId
import org.tod87et.roomkn.server.database.ConstraintViolationException
import org.tod87et.roomkn.server.database.Database
import org.tod87et.roomkn.server.database.MissingElementException
import org.tod87et.roomkn.server.database.ReservationException
import org.tod87et.roomkn.server.database.SerializationException
import org.tod87et.roomkn.server.di.ReservationConfig
import org.tod87et.roomkn.server.di.injectDatabase
import org.tod87et.roomkn.server.models.permissions.UserPermission
import org.tod87et.roomkn.server.models.reservations.FailedReservation
import org.tod87et.roomkn.server.models.reservations.MultipleReservationResult
import org.tod87et.roomkn.server.models.reservations.NewReservationBounds
import org.tod87et.roomkn.server.models.reservations.ReservationRequest
import org.tod87et.roomkn.server.models.reservations.ReservationSortParameter
import org.tod87et.roomkn.server.models.reservations.toUnregisteredReservation
import org.tod87et.roomkn.server.util.defaultExceptionHandler
import kotlin.time.Duration.Companion.seconds
import org.tod87et.roomkn.server.util.toResultInstantOrNull
import org.tod87et.roomkn.server.util.toResultIntOrDefault
import org.tod87et.roomkn.server.util.toResultLongOrDefault

private val DEFAULT_RETRY_AFTER = 10.seconds

fun Route.reservationsRouting() {
    val database by injectDatabase()
    authenticate(AuthenticationProvider.SESSION) {
        route("/reserve") {
            reserveRouting(database)

            route("/multiple") {
                reserveMultipleRouting(database)
            }
        }

        route("/reservations") {
            route("/by-room") {
                roomReservationsRouting(database)
            }
            route("/by-user") {
                userReservationsRouting(database)
            }

            reserveRouting(database)
            reservationListRouting(database)
            reservationDeleteRouting(database)
            reservationUpdateRouting(database)
        }
    }
}

/**
 * Requires {id} parameter (room id).
 */
suspend fun PipelineContext<Unit, ApplicationCall>.roomReservationsRouteHandler(database: Database) {
    val roomId = call.parameters["id"]?.toIntOrNull() ?: return call.onMissingId()
    val result = database.getRoomReservations(roomId)

    result
        .onSuccess {
            call.respond(HttpStatusCode.OK, it)
        }
        .onFailure {
            call.handleRoomException(it)
        }
}

private fun Route.roomReservationsRouting(database: Database) {
    get("/{id}") {
        roomReservationsRouteHandler(database)
    }
}

private fun Route.userReservationsRouting(database: Database) {
    get("/{id}") {
        val userId = call.parameters["id"]?.toIntOrNull() ?: return@get call.onMissingId()
        val result = database.getUserReservations(userId)

        result
            .onSuccess {
                call.respond(HttpStatusCode.OK, it)
            }
            .onFailure {
                call.handleUserException(it)
            }
    }
}

private fun Route.reservationDeleteRouting(database: Database) {
    delete("/{id}") {
        val id = call.parameters["id"]?.toInt() ?: return@delete call.onMissingId()
        val reservation = database.getReservation(id)
            .getOrElse {
                return@delete call.handleReservationException(it)
            }
        call.requirePermissionOrSelf(reservation.userId, database) { return@delete call.onMissingPermission() }

        val result = database.deleteReservation(id)
        result
            .onSuccess {
                call.respond(HttpStatusCode.OK, it)
            }
            .onFailure {
                call.handleReservationException(it)
            }
    }
}

private fun Route.reservationUpdateRouting(database: Database) {
    put("/{id}") { body: NewReservationBounds ->
        val id = call.parameters["id"]?.toInt() ?: return@put call.onMissingId()
        val reservation = database.getReservation(id).getOrElse {
            return@put call.handleReservationException(it)
        }
        call.requirePermissionOrSelf(reservation.userId, database) { return@put call.onMissingPermission() }

        database.updateReservation(id, body.from, body.until)
            .onSuccess { call.respond(HttpStatusCode.OK, it) }
            .onFailure { call.handleReservationException(it) }
    }
}


private fun String?.toSortOrder(default: SortOrder): SortOrder? = when (this) {
    null -> default
    "asc" -> SortOrder.ASC
    "desc" -> SortOrder.DESC
    else -> null
}

private fun Route.reserveRouting(database: Database) {
    val reservationConfig by inject<ReservationConfig>()

    post { body: ReservationRequest ->
        val userId = call.principal<AuthSession>()!!.userId
        call.requireReservationCreatePermission(database) { return@post call.onMissingPermission() }
        if (!checkReservationBounds(body.from, body.until, reservationConfig) && !call.isReservationAdmin(database)) {
            return@post call.respondText(
                "Reservation is too far in past or future or is too long",
                status = HttpStatusCode.Forbidden
            )
        }

        val result = database.createReservation(body.toUnregisteredReservation(userId))
        result
            .onSuccess {
                call.respond(HttpStatusCode.Created, it)
            }
            .onFailure {
                call.handleReservationException(it)
            }
    }
}

private fun Route.reserveMultipleRouting(database: Database) {
    val logger = KtorSimpleLogger("reservationsRouting")
    val reservationConfig by inject<ReservationConfig>()

    post { body: List<ReservationRequest> ->
        val userId = call.principal<AuthSession>()!!.userId
        call.requireReservationCreatePermission(database) { return@post call.onMissingPermission() }

        val now = Clock.System.now()
        val isAdmin by lazy(LazyThreadSafetyMode.NONE) { call.isReservationAdmin(database) }


        val (initiallyFailed, requests) = body.asSequence().map {
            if (checkReservationBounds(it.from, it.until, reservationConfig, now) || isAdmin) {
                Result.success(it.toUnregisteredReservation(userId))
            } else {
                Result.failure(
                    IllegalReservationBoundsException(
                        FailedReservation(it, "Reservation is too far in past or future or is too long")
                    )
                )
            }
        }
            .partition { it.isFailure }
            .let { (failed, successful) ->
                failed.map { (it.exceptionOrNull() as IllegalReservationBoundsException).res } to
                        successful.map { it.getOrThrow() }
            }
        val result = database.createMultipleReservations(requests)
        val reserved = result.mapNotNull { it.getOrNull() }
        val failed = result.mapIndexedNotNull { index, res ->
            res.exceptionOrNull()?.let { ex ->
                val msg = when (ex) {
                    is ConstraintViolationException, is ReservationException -> {
                        "Failed to add reservation: conflict with other reservations"
                    }

                    else -> {
                        logger.warn("unknown error during reserve multiple", ex)
                        "Server error"
                    }
                }
                FailedReservation(body[index], msg)
            }
        }
        val res = MultipleReservationResult(reserved, initiallyFailed + failed)

        call.respond(HttpStatusCode.Created, res)
    }
}

private fun Route.reservationListRouting(database: Database) {
    get {
        val from = call.request.queryParameters["from"].toResultInstantOrNull()
            .getOrElse { return@get call.onIncorrectTimestamp() }

        val until = call.request.queryParameters["until"].toResultInstantOrNull()
            .getOrElse { return@get call.onIncorrectTimestamp() }

        val userIds = call.request.queryParameters["user_ids"]?.split(",")?.map {
            it.toIntOrNull() ?: return@get call.respondText(
                "id in userIds should be int",
                status = HttpStatusCode.BadRequest
            )
        } ?: listOf()

        val roomIds = call.request.queryParameters["room_ids"]?.split(",")?.map {
            it.toIntOrNull() ?: return@get call.respondText(
                "id in roomIds should be int",
                status = HttpStatusCode.BadRequest
            )
        } ?: listOf()

        val limit = call.request.queryParameters["limit"].toResultIntOrDefault(Int.MAX_VALUE)
            .getOrElse { return@get call.onIncorrectLimit() }

        val offset = call.request.queryParameters["offset"].toResultLongOrDefault(0)
            .getOrElse { return@get call.onIncorrectOffset() }

        val sortParameter = call.request.queryParameters["sort_by"]?.let {
            ReservationSortParameter.parse(it) ?: return@get call.respondText(
                "unknown sort parameter",
                status = HttpStatusCode.BadRequest
            )
        }
        val sortOrder =
            call.request.queryParameters["sort_order"].toSortOrder(SortOrder.ASC) ?: return@get call.respondText(
                "unknown sort order",
                status = HttpStatusCode.BadRequest
            )

        database.getReservations(
            usersIds = userIds,
            roomsIds = roomIds,
            from = from,
            until = until,
            limit = limit,
            offset = offset,
            sortParameter = sortParameter,
            sortOrder = sortOrder
        )
            .onSuccess {
                call.respond(HttpStatusCode.OK, it)
            }
            .onFailure {
                call.handleReservationException(it)
            }
    }
    get("/size") {
        val fromResult = call.request.queryParameters["from"].toResultInstantOrNull()
        val untilResult = call.request.queryParameters["until"].toResultInstantOrNull()
        val userIdsString = call.request.queryParameters["user_ids"]
        val roomIdsString = call.request.queryParameters["room_ids"]

        val userIds = userIdsString?.split(",")?.map {
            it.toIntOrNull() ?: return@get call.respondText(
                "id in userIds should be int",
                status = HttpStatusCode.BadRequest
            )
        } ?: listOf()
        val roomIds = roomIdsString?.split(",")?.map {
            it.toIntOrNull() ?: return@get call.respondText(
                "id in roomIds should be int",
                status = HttpStatusCode.BadRequest
            )
        } ?: listOf()
        val from = fromResult.getOrElse { return@get call.onIncorrectTimestamp() }
        val until = untilResult.getOrElse { return@get call.onIncorrectTimestamp() }
        database.getReservationsSize(userIds, roomIds, from, until)
            .onSuccess {
                call.respond(it)
            }
            .onFailure {
                call.handleReservationException(it)
            }
    }
}

private inline fun ApplicationCall.requireReservationCreatePermission(
    database: Database,
    onPermissionMissing: () -> Nothing
) {
    requirePermissionOrSelfImpl(null, database, UserPermission.ReservationsCreate, onPermissionMissing)
}

private fun checkReservationBounds(
    from: Instant,
    until: Instant,
    config: ReservationConfig,
    now: Instant = Clock.System.now(),
): Boolean {
    val notTooFarInPast = until >= now - config.maxPastOffset
    val notTooFarInFuture = from <= now + config.maxFutureOffset
    val notTooLong = until - from <= config.maxReservationDuration

    return notTooFarInPast && notTooFarInFuture && notTooLong
}

private fun ApplicationCall.isReservationAdmin(
    database: Database
): Boolean {
    val session = principal<AuthSession>() ?: return false
    return database.getUserPermissions(session.userId).getOrNull()?.contains(UserPermission.ReservationsAdmin) == true
}

private inline fun ApplicationCall.requireAdminPermission(
    database: Database,
    onPermissionMissing: () -> Nothing
) {
    requirePermissionOrSelfImpl(null, database, UserPermission.ReservationsAdmin, onPermissionMissing)
}

private inline fun ApplicationCall.requirePermissionOrSelf(
    self: Int,
    database: Database,
    onPermissionMissing: () -> Nothing
) {
    requirePermissionOrSelfImpl(self, database, UserPermission.ReservationsAdmin, onPermissionMissing)
}

private suspend fun ApplicationCall.handleReservationException(ex: Throwable) {
    when (ex) {
        is MissingElementException -> {
            respondText("No such reservation", status = HttpStatusCode.BadRequest)
        }

        is ConstraintViolationException, is ReservationException -> {
            respondText(
                "Failed to add reservation: conflict with other reservations",
                status = HttpStatusCode.Conflict
            )
        }

        is SerializationException -> {
            respondText(
                "Server is overloaded, please try again a few seconds later",
                status = HttpStatusCode.ServiceUnavailable
            ) {
                headers {
                    append("Retry-After", DEFAULT_RETRY_AFTER.inWholeSeconds.toString())
                }
            }
        }

        else -> {
            defaultExceptionHandler(ex)
        }
    }
}

private suspend fun ApplicationCall.handleRoomException(ex: Throwable) {
    when (ex) {
        is MissingElementException -> {
            respondText("No such room", status = HttpStatusCode.BadRequest)
        }

        else -> {
            defaultExceptionHandler(ex)
        }
    }
}

private suspend fun ApplicationCall.handleUserException(ex: Throwable) {
    when (ex) {
        is MissingElementException -> {
            respondText("No such user", status = HttpStatusCode.BadRequest)
        }

        else -> {
            defaultExceptionHandler(ex)
        }
    }
}

private class IllegalReservationBoundsException(val res: FailedReservation, cause: Throwable? = null) :
    Exception(res.message, cause)
