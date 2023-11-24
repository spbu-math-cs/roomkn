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
import org.tod87et.roomkn.server.auth.AuthSession
import org.tod87et.roomkn.server.auth.AuthenticationProvider
import org.tod87et.roomkn.server.auth.userId
import org.tod87et.roomkn.server.database.ConstraintViolationException
import org.tod87et.roomkn.server.database.Database
import org.tod87et.roomkn.server.database.MissingElementException
import org.tod87et.roomkn.server.di.injectDatabase
import org.tod87et.roomkn.server.models.permissions.UserPermission
import org.tod87et.roomkn.server.models.reservations.ReservationRequest
import org.tod87et.roomkn.server.models.reservations.toUnregisteredReservation
import org.tod87et.roomkn.server.util.defaultExceptionHandler

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

private fun Route.reserveRouting(database: Database) {
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
    database: Database,
    onPermissionMissing: () -> Nothing
) {
    val session = principal<AuthSession>()
    if (session == null || session.userId != self) {
        onPermissionMissing()
    } else {
        database.getUserPermissions(session.userId)
            .onFailure { onPermissionMissing() }
            .onSuccess { permissions ->
                if (!permissions.contains(UserPermission.ReservationsAdmin)) {
                    onPermissionMissing()
                }
            }
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
