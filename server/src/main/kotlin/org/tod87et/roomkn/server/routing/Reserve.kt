package org.tod87et.roomkn.server.routing

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.auth.principal
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import org.tod87et.roomkn.server.auth.AuthSession
import org.tod87et.roomkn.server.database.DatabaseFactory.database
import org.tod87et.roomkn.server.models.reservations.UnregisteredReservation

fun Route.reserveRouting() {
    post("/reserve") { unregisteredReservation: UnregisteredReservation ->
        val userId = call.principal<AuthSession>()?.userId ?: unregisteredReservation.userId
        val result = database.createReservation(unregisteredReservation.copy(userId = userId))
        result.onSuccess {
            call.respond(HttpStatusCode.Created, it)
        }
        result.onFailure {
            return@post call.respondText(
                "Failed to add reservation: conflict with other reservations",
                status = HttpStatusCode.Conflict
            )
        }
    }
}