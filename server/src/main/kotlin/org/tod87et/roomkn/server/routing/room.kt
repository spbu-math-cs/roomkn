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
import org.tod87et.roomkn.server.auth.AuthenticationProvider
import org.tod87et.roomkn.server.database.Database
import org.tod87et.roomkn.server.database.MissingElementException
import org.tod87et.roomkn.server.di.injectDatabase
import org.tod87et.roomkn.server.models.permissions.UserPermission
import org.tod87et.roomkn.server.models.rooms.NewRoomInfo
import org.tod87et.roomkn.server.models.rooms.NewRoomInfoWithNull
import org.tod87et.roomkn.server.util.defaultExceptionHandler
import org.tod87et.roomkn.server.util.okResponse
import org.tod87et.roomkn.server.util.toResultIntOrDefault
import org.tod87et.roomkn.server.util.toResultLongOrDefault

fun Route.roomsRouting() {
    val database by injectDatabase()
    route("/rooms") {
        rooms(database)
        roomsShort(database)
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
        val limitResult = call.request.queryParameters["limit"].toResultIntOrDefault(Int.MAX_VALUE)
        val offsetResult = call.request.queryParameters["offset"].toResultLongOrDefault(0)
        val limit = limitResult.getOrElse { return@get call.onIncorrectLimit() }
        val offset = offsetResult.getOrElse { return@get call.onIncorrectOffset() }

        if (limit < 0 || offset < 0)
            return@get call.respondText(
                "Incorrect limit or offset",
                status = HttpStatusCode.BadRequest
            )

        val result = database.getRooms(limit, offset)
        result
            .onSuccess { call.respond(it) }
            .onFailure { call.handleException(it) }
    }
    get("/size") {
        val result = database.getRoomsSize()
        result
            .onSuccess { call.respond(it) }
            .onFailure { call.handleException(it) }
    }
}

private fun Route.roomsShort(database: Database) {
    get("/list-short") {
        val ids = (call.request.queryParameters["ids"] ?: return@get call.onMalformedIds()).split(",")
            .map { it.toIntOrNull() ?: return@get call.onMalformedIds() }

        database.getRoomsShort(ids)
            .onSuccess {
                call.respond(it)
            }
            .onFailure {
                call.handleException(it)
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
            respondText("No such element", status = HttpStatusCode.NotFound)
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
