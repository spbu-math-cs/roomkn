package org.tod87et.roomkn.server.routing

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.tod87et.roomkn.server.database.DatabaseFactory.database

fun Route.room() {
    rooms()
    roomId()
    roomReservations()
}
fun Route.rooms() {
    get("/rooms") {
        val limit = call.request.queryParameters["limit"]?.toIntOrNull() ?: Int.MAX_VALUE
        val offset = call.request.queryParameters["offset"]?.toIntOrNull() ?: 0

        val result = database.getRooms()

        result.onSuccess {
            call.respond(HttpStatusCode.OK, it)
        }

        result.onFailure {
            call.respondText(
                "",
                status = HttpStatusCode.InternalServerError
            )
        }
    }
}

fun Route.roomId() {
    get("/rooms/{id}") {
        val id = call.parameters["id"]?.toIntOrNull() ?:return@get call.respondText(
            "Id should be int",
            status = HttpStatusCode.BadRequest
        )

        val result = database.getRoom(id)

        result.onSuccess {
            call.respond(HttpStatusCode.OK, it)
        }

        result.onFailure {
            call.respondText (
                "",
                status = HttpStatusCode.NotFound
            )
        }
    }
}

fun Route.roomReservations() {
    get("/rooms/{id}/reservations") {
        val id = call.parameters["id"]?.toIntOrNull() ?:return@get call.respondText(
            "Id should be int",
            status = HttpStatusCode.BadRequest
        )

        val result = database.getRoomReservations(id)

        result.onSuccess {
            call.respond(HttpStatusCode.OK, it)
        }

        result.onFailure {
            call.respondText (
                "",
                status = HttpStatusCode.NotFound
            )
        }
    }
}