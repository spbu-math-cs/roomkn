package org.tod87et.roomkn.server.routing


import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import org.tod87et.roomkn.server.database.DatabaseFactory.database

fun Route.roomsRouting() {
    route("/rooms") {
        rooms()
        roomId()
        roomReservations()
    }
}

private fun Route.rooms() {
    get {
        val limit = call.request.queryParameters["limit"]?.toIntOrNull() ?: Int.MAX_VALUE
        val offset = call.request.queryParameters["offset"]?.toIntOrNull() ?: 0

        val result = database.getRooms()

        result.onSuccess {
            call.respond(HttpStatusCode.OK, it)
        }

        result.onFailure {
            call.respondText(
                "Failed to get data from database",
                status = HttpStatusCode.InternalServerError
            )
        }
    }
}

private fun Route.roomId() {
    get("/{id}") {
        val id = call.parameters["id"]?.toIntOrNull() ?: return@get call.respondText(
            "Id should be int",
            status = HttpStatusCode.BadRequest
        )

        val result = database.getRoom(id)

        result.onSuccess {
            call.respond(HttpStatusCode.OK, it)
        }

        result.onFailure {
            call.respondText(
                "Room with this id not fount",
                status = HttpStatusCode.NotFound
            )
        }
    }
}

private fun Route.roomReservations() {
    get("/{id}/reservations") {
        val id = call.parameters["id"]?.toIntOrNull() ?: return@get call.respondText(
            "Id should be int",
            status = HttpStatusCode.BadRequest
        )

        val result = database.getRoomReservations(id)

        result.onSuccess {
            call.respond(HttpStatusCode.OK, it)
        }

        result.onFailure {
            call.respondText(
                "Room with this id not fount",
                status = HttpStatusCode.NotFound
            )
        }
    }
}