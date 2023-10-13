package org.tod87et.roomkn.server.routing

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import org.tod87et.roomkn.server.database.DatabaseFactory.database
import org.tod87et.roomkn.server.models.UnregisteredReservation

fun Route.reserveRouting() {
    post("/reserve") { unregisteredReservation: UnregisteredReservation ->
        val result = database.createReservation(unregisteredReservation)
        result.onSuccess {
            call.respond(HttpStatusCode.Created, it)
        }
        result.onFailure {
            call.respondText(
                "Failed to add reservation: conflict with other reservations",
                status = HttpStatusCode.Conflict
            )
        }
    }
}