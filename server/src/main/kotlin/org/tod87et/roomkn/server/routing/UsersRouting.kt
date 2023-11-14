package org.tod87et.roomkn.server.routing

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.principal
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.put
import io.ktor.server.routing.route
import org.tod87et.roomkn.server.auth.AuthSession
import org.tod87et.roomkn.server.auth.AuthenticationProvider
import org.tod87et.roomkn.server.auth.NoSuchUserException
import org.tod87et.roomkn.server.auth.permissions
import org.tod87et.roomkn.server.auth.userId
import org.tod87et.roomkn.server.database.DatabaseFactory
import org.tod87et.roomkn.server.models.permissions.UserPermission
import org.tod87et.roomkn.server.models.users.UpdateUserInfo
import org.tod87et.roomkn.server.util.defaultExceptionHandler

fun Route.usersRouting() {
    authenticate(AuthenticationProvider.SESSION) {
        route("/users") {
            listUsers()
            updateUser()
            deleteUser()
            getUser()
            listUserPermissions()
            setUserPermissions()
        }
    }
}

private fun Route.listUsers() {
    get {
        call.requirePermission { return@get call.onMissingPermission() }

        DatabaseFactory.database.getUsers()
            .onSuccess { call.respond(it) }
            .onFailure { call.handleException(it) }
    }
}

private fun Route.deleteUser() {
    delete("/{id}") {
        val id = call.parameters["id"]?.toInt() ?: return@delete call.onMissingId()
        call.requirePermission { return@delete call.onMissingPermission() }

        DatabaseFactory.database.deleteUser(id)
            .onSuccess { call.respond("Ok") }
            .onFailure { call.handleException(it) }
    }
}

private fun Route.updateUser() {
    put("/{id}") { body: UpdateUserInfo ->
        val id = call.parameters["id"]?.toInt() ?: return@put call.onMissingId()
        call.requirePermissionOrSelf(id) { return@put call.onMissingPermission() }

        DatabaseFactory.database.updateUserInfo(id, body)
            .onSuccess { call.respond("Ok") }
            .onFailure { call.handleException(it) }
    }
}

private fun Route.listUserPermissions() {
    get("/{id}/permissions") {
        val id = call.parameters["id"]?.toInt() ?: return@get call.onMissingId()
        call.requirePermissionOrSelf(id) { return@get call.onMissingPermission() }

        DatabaseFactory.database.getUserPermissions(id)
            .onSuccess { call.respond(it) }
            .onFailure { call.handleException(it) }
    }
}

private fun Route.getUser() {
    get("/{id}") {
        val id = call.parameters["id"]?.toInt() ?: return@get call.onMissingId()

        DatabaseFactory.database.getUser(id)
            .onSuccess { call.respond(it) }
            .onFailure { call.handleException(it) }
    }
}

private fun Route.setUserPermissions() {
    put("/{id}/permissions") { body: List<UserPermission> ->
        val id = call.parameters["id"]?.toInt() ?: return@put call.onMissingId()
        call.requirePermission { return@put call.onMissingPermission() }

        DatabaseFactory.database.updateUserPermissions(id, body)
            .onSuccess { call.respondText("Ok") }
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
    onPermissionMissing: () -> Nothing
) {
    requirePermissionOrSelfImpl(self = null, onPermissionMissing)
}

private inline fun ApplicationCall.requirePermissionOrSelf(
    self: Int,
    onPermissionMissing: () -> Nothing
) {
    requirePermissionOrSelfImpl(self, onPermissionMissing)
}

private inline fun ApplicationCall.requirePermissionOrSelfImpl(
    self: Int?,
    onPermissionMissing: () -> Nothing
) {
    val session = principal<AuthSession>()
    if (session == null || session.userId != self && !session.permissions.contains(UserPermission.UsersAdmin)) {
        onPermissionMissing()
    }
}
