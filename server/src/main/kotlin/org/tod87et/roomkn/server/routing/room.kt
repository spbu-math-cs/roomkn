package org.tod87et.roomkn.server.routing


import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.put
import io.ktor.server.routing.route
import kotlin.math.min
import org.tod87et.roomkn.server.auth.AuthenticationProvider
import org.tod87et.roomkn.server.database.Database
import org.tod87et.roomkn.server.database.MissingElementException
import org.tod87et.roomkn.server.di.injectDatabase
import org.tod87et.roomkn.server.models.permissions.UserPermission
import org.tod87et.roomkn.server.models.rooms.NewRoomInfo
import org.tod87et.roomkn.server.util.defaultExceptionHandler

fun Route.roomsRouting() {
    val database by injectDatabase()
    route("/rooms") {
        rooms(database)
        roomById(database)
        roomReservationsRouting(database)
        authenticate(AuthenticationProvider.SESSION) {
            createRoom(database)
            updateRoom(database)
            deleteRoom(database)
        }
    }
    route("/map") {
        getMap(database)
        authenticate(AuthenticationProvider.SESSION) {
            updateMap(database)
        }
    }
}

private fun Route.roomReservationsRouting(database: Database) {
    get("{id}/reservations") {
        roomReservationsRouteHandler(database)
    }
}

private fun Route.createRoom(database: Database) {
    post { body: NewRoomInfo ->
        call.requirePermission(database) { return@post call.onMissingPermission() }

        database.createRoom(body)
            .onSuccess {
                call.respond("Ok")
            }
            .onFailure {
                call.handleException(it)
            }
    }
}

private fun Route.deleteRoom(database: Database) {
    delete("/{id}") {
        val id = call.parameters["id"]?.toInt() ?: return@delete call.onMissingId()
        call.requirePermission(database) { return@delete call.onMissingPermission() }

        database.deleteRoom(id)
            .onSuccess {
                call.respond("Ok")
            }
            .onFailure {
                call.handleException(it)
            }
    }
}

private fun Route.updateRoom(database: Database) {
    put("/{id}") { body: NewRoomInfo ->
        val id = call.parameters["id"]?.toInt() ?: return@put call.onMissingId()
        call.requirePermission(database) { return@put call.onMissingPermission() }

        database.updateRoom(id, body)
            .onSuccess {
                call.respond("Ok")
            }
            .onFailure {
                call.handleException(it)
            }
    }
}

private fun Route.rooms(database: Database) {
    get {
        val limit = call.request.queryParameters["limit"]?.toIntOrNull() ?: Int.MAX_VALUE
        val offset = call.request.queryParameters["offset"]?.toIntOrNull() ?: 0

//        FIXME make usable limit offset

        val result = database.getRooms()

        val right = offset + limit

        if (limit < 0 || offset < 0 || offset > right)
            return@get call.respondText(
                "Incorrect limit or offset",
                status = HttpStatusCode.BadRequest
            )

        result.onSuccess {
            call.respond(
                HttpStatusCode.OK,
                it.subList(
                    min(offset, it.size),
                    min(right, it.size)
                )
            )
        }

        result.onFailure {
            return@get call.respondText(
                "Failed to get data from database",
                status = HttpStatusCode.InternalServerError
            )
        }
    }
}

private fun Route.roomById(database: Database) {
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
            return@get call.respondText(
                "Room with this id not found",
                status = HttpStatusCode.NotFound
            )
        }
    }
}

private fun Route.getMap(database: Database) {
    get {
        val result = database.getMap()
        result.onSuccess {

        }
    }
}

private fun Route.updateMap(database: Database) {
    put {
        //TODO
    }
}

private suspend fun ApplicationCall.handleException(ex: Throwable) {
    when (ex) {
        is MissingElementException -> {
            respondText("No such room", status = HttpStatusCode.BadRequest)
        }

        else -> {
            defaultExceptionHandler(ex)
        }
    }
}

private inline fun ApplicationCall.requirePermission(
    database: Database,
    onPermissionMissing: () -> Nothing
) {
    requirePermissionOrSelfImpl(null, database, UserPermission.RoomsAdmin, onPermissionMissing)
}
