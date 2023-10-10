package org.tod87et.roomkn.server.routing

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.tod87et.roomkn.server.database.DatabaseFactory.database
import org.tod87et.roomkn.server.models.UnregisteredReservation

fun Route.reserve() {
    post("/reserve") {body: UnregisteredReservation ->
        val result = database.createReservation(body)
        result.onSuccess {
            call.respond(HttpStatusCode.Created, it)
        }
        result.onFailure {
            call.respondText (
                "",
                status = HttpStatusCode.Conflict
            )
        }
    }
}