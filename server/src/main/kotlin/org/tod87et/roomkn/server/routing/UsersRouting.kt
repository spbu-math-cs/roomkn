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
import io.ktor.server.routing.put
import io.ktor.server.routing.route
import org.tod87et.roomkn.server.auth.AuthenticationProvider
import org.tod87et.roomkn.server.auth.NoSuchUserException
import org.tod87et.roomkn.server.database.Database
import org.tod87et.roomkn.server.di.injectDatabase
import org.tod87et.roomkn.server.models.permissions.UserPermission
import org.tod87et.roomkn.server.models.users.UpdateUserInfo
import org.tod87et.roomkn.server.util.defaultExceptionHandler

fun Route.usersRouting() {
    val database: Database by injectDatabase()
    authenticate(AuthenticationProvider.SESSION) {
        route("/users") {
            listUsers(database)
            updateUser(database)
            deleteUser(database)
            getUser(database)
            listUserPermissions(database)
            setUserPermissions(database)
        }
    }
}

private fun Route.listUsers(database: Database) {
    get {
        val limit: Int = call.request.queryParameters["limit"]?.toIntOrNull() ?: Int.MAX_VALUE
        val offset: Long = call.request.queryParameters["offset"]?.toLongOrNull() ?: 0
        val includePermissions: Boolean = call.request.queryParameters["includePermissions"] == "true"

        call.requirePermission(database) { return@get call.onMissingPermission() }

        // should be in different branches to be correctly serialized
        if (includePermissions) {
            database.getFullUsers(limit = limit, offset = offset)
                .onSuccess { call.respond(it) }
                .onFailure { call.handleException(it) }
        } else {
            database.getUsers(limit = limit, offset = offset)
                .onSuccess { call.respond(it) }
                .onFailure { call.handleException(it) }
        }
    }
}

private fun Route.deleteUser(database: Database) {
    delete("/{id}") {
        val id = call.parameters["id"]?.toInt() ?: return@delete call.onMissingId()
        call.requirePermission(database) { return@delete call.onMissingPermission() }

        database.deleteUser(id).onSuccess { call.respond("Ok") }.onFailure { call.handleException(it) }
    }
}

private fun Route.updateUser(database: Database) {
    put("/{id}") { body: UpdateUserInfo ->
        val id = call.parameters["id"]?.toInt() ?: return@put call.onMissingId()
        call.requirePermissionOrSelf(id, database) { return@put call.onMissingPermission() }

        database.updateUserInfo(id, body).onSuccess { call.respond("Ok") }.onFailure { call.handleException(it) }
    }
}

private fun Route.listUserPermissions(database: Database) {
    get("/{id}/permissions") {
        val id = call.parameters["id"]?.toInt() ?: return@get call.onMissingId()
        call.requirePermissionOrSelf(id, database) { return@get call.onMissingPermission() }

        database.getUserPermissions(id).onSuccess { call.respond(it) }.onFailure { call.handleException(it) }
    }
}

private fun Route.getUser(database: Database) {
    get("/{id}") {
        val id = call.parameters["id"]?.toInt() ?: return@get call.onMissingId()

        database.getUser(id).onSuccess { call.respond(it) }.onFailure { call.handleException(it) }
    }
}

private fun Route.setUserPermissions(database: Database) {
    put("/{id}/permissions") { body: List<UserPermission> ->
        val id = call.parameters["id"]?.toInt() ?: return@put call.onMissingId()
        call.requirePermission(database) { return@put call.onMissingPermission() }

        database.updateUserPermissions(id, body).onSuccess { call.respondText("Ok") }
            .onFailure { call.handleException(it) }
    }
}

private suspend fun ApplicationCall.handleException(ex: Throwable) {
    when (ex) {
        is NoSuchUserException -> {
            respondText("No such user", status = HttpStatusCode.BadRequest)
        }

        else -> {
            defaultExceptionHandler(ex)
        }
    }
}

private inline fun ApplicationCall.requirePermission(
    database: Database, onPermissionMissing: () -> Nothing
) {
    requirePermissionOrSelfImpl(self = null, database, UserPermission.UsersAdmin, onPermissionMissing)
}

private inline fun ApplicationCall.requirePermissionOrSelf(
    self: Int, database: Database, onPermissionMissing: () -> Nothing
) {
    requirePermissionOrSelfImpl(self, database, UserPermission.UsersAdmin, onPermissionMissing)
}
