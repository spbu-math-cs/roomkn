package org.tod87et.roomkn.server.routing

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.auth.principal
import io.ktor.server.response.respondText
import org.jetbrains.exposed.sql.exposedLogger
import org.tod87et.roomkn.server.auth.AuthSession
import org.tod87et.roomkn.server.auth.userId
import org.tod87et.roomkn.server.database.Database
import org.tod87et.roomkn.server.models.permissions.UserPermission


suspend fun ApplicationCall.onMissingPermission() {
    respondText("Missing permission", status = HttpStatusCode.Forbidden)
}

suspend fun ApplicationCall.onMissingId() {
    respondText("id should be int", status = HttpStatusCode.BadRequest)
}

suspend fun ApplicationCall.onIncorrectTimestamp() {
    respondText("timestamp should be correct Instant", status = HttpStatusCode.BadRequest)
}

suspend fun ApplicationCall.onIncorrectLimit() {
    respondText("limit should be int", status = HttpStatusCode.BadRequest)
}

suspend fun ApplicationCall.onIncorrectOffset() {
    respondText("offset should be long", status = HttpStatusCode.BadRequest)
}


inline fun ApplicationCall.requirePermissionOrSelfImpl(
    self: Int?,
    database: Database,
    requiredPermission: UserPermission,
    onPermissionMissing: () -> Nothing
) {
    val session = principal<AuthSession>()
    if (session == null) {
        onPermissionMissing()
    } else if (session.userId != self) {
        database.getUserPermissions(session.userId)
            .onFailure { onPermissionMissing() }
            .onSuccess { permissions ->
                if (!permissions.contains(requiredPermission)) {
                    exposedLogger.debug(
                        "User Id {} don't have {} - List of user permissions: {}",
                        session.userId,
                        requiredPermission,
                        permissions
                    )
                    onPermissionMissing()
                }
            }
    }
}