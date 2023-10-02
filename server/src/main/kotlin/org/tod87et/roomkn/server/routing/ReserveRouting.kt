package org.tod87et.roomkn.server.routing

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import org.tod87et.roomkn.server.database.DatabaseFactory
import org.tod87et.roomkn.server.models.Reservation

fun Route.reserveRouting() {
    post("/reserve") { body: Reservation ->
        if (body.from >= body.until) {
            call.respondText("Until should be later than from", status = HttpStatusCode.BadRequest)
            return@post
        }
        val res = with(body) {
            DatabaseFactory.database.createReservation(userId, roomId, from, until)
        }

        when (res) {
            null -> call.respondText("Collision detected", status = HttpStatusCode.Conflict)
            else -> call.respond(HttpStatusCode.OK, res)
        }
    }
}
