package org.tod87et.roomkn.server.routing

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
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
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.Date
import kotlinx.datetime.toJavaInstant
import org.koin.ktor.ext.inject
import org.tod87et.roomkn.server.auth.AccountController
import org.tod87et.roomkn.server.auth.AuthConfig
import org.tod87et.roomkn.server.auth.AuthenticationProvider
import org.tod87et.roomkn.server.auth.NoSuchUserException
import org.tod87et.roomkn.server.database.Database
import org.tod87et.roomkn.server.database.MissingElementException
import org.tod87et.roomkn.server.di.injectDatabase
import org.tod87et.roomkn.server.models.permissions.UserPermission
import org.tod87et.roomkn.server.models.users.InviteRequest
import org.tod87et.roomkn.server.models.users.PasswordUpdateInfo
import org.tod87et.roomkn.server.models.users.SaltedInviteRequest
import org.tod87et.roomkn.server.models.users.UpdateUserInfo
import org.tod87et.roomkn.server.models.users.UpdateUserInfoWithNull
import org.tod87et.roomkn.server.util.defaultExceptionHandler
import org.tod87et.roomkn.server.util.okResponse

fun Route.usersRouting() {
    val config: AuthConfig by inject()
    val threadLocalDigest = ThreadLocal.withInitial { MessageDigest.getInstance(config.hashingAlgorithmId) }
    val threadLocalSecureRandom = ThreadLocal.withInitial { SecureRandom.getInstanceStrong() }
    val database: Database by injectDatabase()
    authenticate(AuthenticationProvider.SESSION) {
        route("/users") {
            listUsers(database)
            updateUser(database)
            deleteUser(database)
            getUser(database)
            listUserPermissions(database)
            setUserPermissions(database)
            updateUserCredentials(database)
            generateInvite(database, threadLocalDigest, threadLocalSecureRandom)
            route("/invitations") {
                getInvitations(database)
                getInvitationToken(database)
                deleteInvitation(database)
            }
        }
        validateInvitationToken(database, threadLocalDigest)
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
    get("/size") {
        call.requirePermission(database) { return@get call.onMissingPermission() }
        database.getUsersSize()
            .onSuccess {
                call.respond(it)
            }
            .onFailure {
                call.handleException(it)
            }
    }
}

private fun Route.deleteUser(database: Database) {
    delete("/{id}") {
        val id = call.parameters["id"]?.toInt() ?: return@delete call.onMissingId()
        call.requirePermission(database) { return@delete call.onMissingPermission() }

        database.deleteUser(id).okResponseWithHandleException(call)
    }
}

private fun Route.updateUser(database: Database) {
    route("/{id}") {
        put { body: UpdateUserInfo ->
            val id = call.parameters["id"]?.toInt() ?: return@put call.onMissingId()
            call.requirePermissionOrSelf(id, database) { return@put call.onMissingPermission() }

            database.updateUserInfo(id, body).okResponseWithHandleException(call)
        }
        patch { body: UpdateUserInfoWithNull ->
            val id = call.parameters["id"]?.toInt() ?: return@patch call.onMissingId()
            call.requirePermissionOrSelf(id, database) { return@patch call.onMissingPermission() }

            database.updateUserInfoPartially(id, body).okResponseWithHandleException(call)
        }
    }
}

private fun Route.updateUserCredentials(database: Database) {
    val accountController: AccountController by inject()
    put("/{id}/password") { body: PasswordUpdateInfo ->
        val id = call.parameters["id"]?.toInt() ?: return@put call.onMissingId()
        call.requirePermissionOrSelf(id, database) { return@put call.onMissingPermission() }

        accountController.updateUserPassword(id, body).okResponseWithHandleException(call)
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

        database.updateUserPermissions(id, body).okResponseWithHandleException(call)
    }
}

private fun generateToken(invite: SaltedInviteRequest, config: AuthConfig): String {
    return JWT.create().withAudience(config.audience).withIssuer(config.issuer)
        .withClaim("size", invite.size)
        .withClaim("salt", invite.salt.toString())
        .withExpiresAt(Date.from(invite.until.toJavaInstant()))
        .sign(Algorithm.HMAC256(config.secret))
}

private fun Route.generateInvite(database: Database, threadLocalDigest: ThreadLocal<MessageDigest>, threadLocalSecureRandom:  ThreadLocal<SecureRandom>) {
    val config: AuthConfig by inject()
    post("/invite") { body: InviteRequest ->
        call.requirePermission(database) { return@post call.onMissingPermission() }
        val secureRandom = threadLocalSecureRandom.get()
        val salt = ByteArray(config.saltSize).apply(secureRandom::nextBytes)
        val saltedBody = body.toSalted(salt)
        val token = generateToken(saltedBody, config)
        val digest = threadLocalDigest.get()
        digest.update(token.toByteArray())
        val tokenResult = database.createInvite(digest.digest(), saltedBody)
        tokenResult.onSuccess {
            call.respondText(token)
        }.onFailure {
            call.handleException(it)
        }
    }
}

private fun Route.getInvitations(database: Database) {
    get {
        call.requirePermission(database) { return@get call.onMissingPermission() }
        val limit: Int = call.request.queryParameters["limit"]?.toIntOrNull() ?: Int.MAX_VALUE
        val offset: Long = call.request.queryParameters["offset"]?.toLongOrNull() ?: 0
        database.getInvites(limit, offset)
            .onSuccess { call.respond(it) }
            .onFailure { call.handleException(it) }
    }
}

private fun Route.getInvitationToken(database: Database) {
    val config: AuthConfig by inject()
    get("/{id}") {
        call.requirePermission(database) { return@get call.onMissingPermission() }
        val id = call.parameters["id"]?.toInt() ?: return@get call.onMissingId()
        database.getInvite(id)
            .onSuccess {
                val token = generateToken(it.toSaltedInviteRequest(), config)
                call.respondText(token)
            }
            .onFailure { call.handleException(it) }
    }
}

private fun Route.deleteInvitation(database: Database) {
    delete("/{id}") {
        call.requirePermission(database) { return@delete call.onMissingPermission() }
        val id = call.parameters["id"]?.toInt() ?: return@delete call.onMissingId()
        database.deleteInvite(id).okResponseWithHandleException(call)
    }
}

private fun Route.validateInvitationToken(database: Database, threadLocalDigest: ThreadLocal<MessageDigest>) {
    get("/invite/validate-token/{token}") {
        val token = call.parameters["token"] ?: return@get call.respondText(
            "Invalid or missing token",
            status = HttpStatusCode.BadRequest
        )
        val digest = threadLocalDigest.get()
        digest.update(token.toByteArray())
        database.validateInvite(digest.digest()).okResponseWithHandleException(call)
    }
}


private suspend fun ApplicationCall.handleException(ex: Throwable) {
    when (ex) {
        is NoSuchUserException -> {
            respondText("No such user", status = HttpStatusCode.BadRequest)
        }

        is MissingElementException -> { //TODO(makselivanov) change it?
            respondText("Invalid invite token", status = HttpStatusCode.BadRequest)
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
    database: Database, onPermissionMissing: () -> Nothing
) {
    requirePermissionOrSelfImpl(self = null, database, UserPermission.UsersAdmin, onPermissionMissing)
}

private inline fun ApplicationCall.requirePermissionOrSelf(
    self: Int, database: Database, onPermissionMissing: () -> Nothing
) {
    requirePermissionOrSelfImpl(self, database, UserPermission.UsersAdmin, onPermissionMissing)
}
