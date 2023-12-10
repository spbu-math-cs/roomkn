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
import io.ktor.server.routing.patch
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
import org.tod87et.roomkn.server.models.rooms.NewRoomInfoWithNull
import org.tod87et.roomkn.server.util.defaultExceptionHandler
import org.tod87et.roomkn.server.util.okResponse

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
        authenticate(AuthenticationProvider.SESSION) {
            getMap(database)
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
        database.createRoom(body).okResponseWithHandleException(call)
    }
}

private fun Route.deleteRoom(database: Database) {
    delete("/{id}") {
        val id = call.parameters["id"]?.toInt() ?: return@delete call.onMissingId()
        call.requirePermission(database) { return@delete call.onMissingPermission() }

        database.deleteRoom(id).okResponseWithHandleException(call)
    }
}

private fun Route.updateRoom(database: Database) {
    route("/{id}") {
        put { body: NewRoomInfo ->
            val id = call.parameters["id"]?.toInt() ?: return@put call.onMissingId()
            call.requirePermission(database) { return@put call.onMissingPermission() }

            database.updateRoom(id, body).okResponseWithHandleException(call)
        }
        patch { body: NewRoomInfoWithNull ->
            val id = call.parameters["id"]?.toInt() ?: return@patch call.onMissingId()
            call.requirePermission(database) { return@patch call.onMissingPermission() }

            database.updateRoomPartially(id, body).okResponseWithHandleException(call)
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
        val id = call.parameters["id"]?.toIntOrNull() ?: return@get call.onMissingId()

        val result = database.getRoom(id)

        result.onSuccess {
            call.respond(HttpStatusCode.OK, it)
        }

        result.onFailure {
            call.handleException(it)
        }
    }
}

private fun Route.getMap(database: Database) {
    get {
        val result = database.getMap()
        result.onSuccess {
            call.respondText(it, status = HttpStatusCode.OK)
        }.onFailure {
            call.handleException(it)
        }
    }
}

private fun Route.updateMap(database: Database) {
    put { newMap: String ->
        call.requirePermission(database) { return@put call.onMissingPermission() }
        val result = database.updateMap(newMap)
        result.onSuccess {
            call.respondText("Ok", status = HttpStatusCode.OK)
        }.onFailure {
            call.handleException(it)
        }
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

/**
 * Response Ok on Success with local handler of exceptions
 */
private suspend fun <T> Result<T>.okResponseWithHandleException(call: ApplicationCall) {
    this.okResponse(call, ApplicationCall::handleException)
}

private inline fun ApplicationCall.requirePermission(
    database: Database,
    onPermissionMissing: () -> Nothing
) {
    requirePermissionOrSelfImpl(null, database, UserPermission.RoomsAdmin, onPermissionMissing)
}
