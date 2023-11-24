package org.tod87et.roomkn.server.routing

import io.ktor.http.HttpStatusCode
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
import io.ktor.server.routing.route
import io.ktor.util.pipeline.PipelineContext
import kotlinx.datetime.Clock
import kotlinx.datetime.Instant
import kotlinx.datetime.toInstant
import org.tod87et.roomkn.server.auth.AuthSession
import org.tod87et.roomkn.server.auth.AuthenticationProvider
import org.tod87et.roomkn.server.auth.permissions
import org.tod87et.roomkn.server.auth.userId
import org.tod87et.roomkn.server.database.ConstraintViolationException
import org.tod87et.roomkn.server.database.Database
import org.tod87et.roomkn.server.database.MissingElementException
import org.tod87et.roomkn.server.di.injectDatabase
import org.tod87et.roomkn.server.models.permissions.UserPermission
import org.tod87et.roomkn.server.models.reservations.ReservationRequest
import org.tod87et.roomkn.server.models.reservations.toUnregisteredReservation
import org.tod87et.roomkn.server.util.defaultExceptionHandler
import kotlin.time.Duration.Companion.days

fun Route.reservationsRouting() {
    val database by injectDatabase()
    authenticate(AuthenticationProvider.SESSION) {
        route("/reserve") {
            reserveRouting(database)
        }

        route("/reservations") {
            route("/by-room") {
                roomReservationsRouting(database)
            }
            route("/by-user") {
                userReservationsRouting(database)
            }

            reserveRouting(database)
            reservationDeleteRouting(database)
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
        call.requirePermissionOrSelf(reservation.userId) { return@delete call.onMissingPermission() }

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

/**
 * If object is null, return Success(default)
 * If object is not null and toInstant is successful, return Success with result
 * Otherwise return Failure(error)
 */
private fun String?.toResultInstant(default: Instant): Result<Instant> {
    return runCatching {
        if (this == null) {
            return@runCatching default
        }
        this.toInstant()
    }
}

private fun Route.reserveRouting(database: Database) {
    get {
        val fromResult = call.request.queryParameters["from"].toResultInstant(Instant.fromEpochMilliseconds(0))
        val untilResult = call.request.queryParameters["until"].toResultInstant(Clock.System.now() + 1.days)
        val usersIdsString = call.request.queryParameters["users"] ?: ""
        val roomsIdsString = call.request.queryParameters["rooms"] ?: ""
        val usersIds = usersIdsString.split(",").map { it.toIntOrNull() ?: return@get call.onMissingId() }
        val roomsIds = roomsIdsString.split(",").map { it.toIntOrNull() ?: return@get call.onMissingId() }
        //TODO add to documentation
        fromResult.onSuccess { from ->
            untilResult.onSuccess { until ->
                val result = database.getReservations(usersIds, roomsIds, from, until)
                    .onSuccess {
                        call.respond(HttpStatusCode.Created, it)
                    }
                    .onFailure {
                        call.handleReservationException(it)
                    }
            }.onFailure {
                call.onMissingTimestamp()
            }
        }.onFailure {
            call.onMissingTimestamp()
        }
    }
    post { body: ReservationRequest ->
        val userId = call.principal<AuthSession>()!!.userId

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

private inline fun ApplicationCall.requirePermissionOrSelf(
    self: Int,
    onPermissionMissing: () -> Nothing
) {
    val session = principal<AuthSession>()
    if (session == null || session.userId != self && !session.permissions.contains(UserPermission.ReservationsAdmin)) {
        onPermissionMissing()
    }
}

private suspend fun ApplicationCall.handleReservationException(ex: Throwable) {
    when (ex) {
        is MissingElementException -> {
            respondText("No such reservation", status = HttpStatusCode.BadRequest)
        }

        is ConstraintViolationException -> {
            respondText(
                "Failed to add reservation: conflict with other reservations",
                status = HttpStatusCode.BadRequest
            )
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
