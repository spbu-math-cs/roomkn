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
import io.ktor.server.routing.post
import io.ktor.server.sessions.sessions
import io.ktor.server.sessions.set
import java.security.MessageDigest
import org.koin.ktor.ext.inject
import org.tod87et.roomkn.server.auth.AccountController
import org.tod87et.roomkn.server.auth.AuthConfig
import org.tod87et.roomkn.server.auth.AuthFailedException
import org.tod87et.roomkn.server.auth.AuthSession
import org.tod87et.roomkn.server.auth.AuthenticationProvider
import org.tod87et.roomkn.server.auth.NoSuchUserException
import org.tod87et.roomkn.server.auth.RegistrationFailedException
import org.tod87et.roomkn.server.auth.userId
import org.tod87et.roomkn.server.database.MissingElementException
import org.tod87et.roomkn.server.di.injectDatabase
import org.tod87et.roomkn.server.models.users.LoginUserInfo
import org.tod87et.roomkn.server.models.users.UnregisteredUserInfo
import org.tod87et.roomkn.server.models.users.UserId
import org.tod87et.roomkn.server.util.defaultExceptionHandler



fun Route.accountRouting() {
    val config: AuthConfig by inject()
    val threadLocalDigest = ThreadLocal.withInitial { MessageDigest.getInstance(config.hashingAlgorithmId) }
    val accountController: AccountController by inject()
    loginRouting(accountController)
    logoutRouting(accountController)
    validateTokenRouting()
    registerRouting(accountController, threadLocalDigest)
}

private fun Route.loginRouting(accountController: AccountController) {
    post("/login") { body: LoginUserInfo ->
        accountController.authenticateUser(body)
            .onSuccess { authSession ->
                call.sessions.set(authSession)
                call.respond(UserId(authSession.userId))
            }
            .onFailure {
                call.handleException(it)
            }
    }
}

private fun Route.logoutRouting(accountController: AccountController) {
    authenticate(AuthenticationProvider.SESSION) {
        delete("/logout") {
            val session = call.principal<AuthSession>(AuthenticationProvider.SESSION)
                ?: return@delete call.respondText("Unauthorized", status = HttpStatusCode.Unauthorized)

            accountController.invalidateSession(session)
            call.sessions.clear(call.sessions.findName(AuthSession::class))

            call.respondText("Logout successful")
        }
    }
}

private fun Route.validateTokenRouting() {
    authenticate(AuthenticationProvider.SESSION) {
        get("/auth/validate-token") {
            val session = call.principal<AuthSession>(AuthenticationProvider.SESSION)
                ?: return@get call.respondText("Unauthorized", status = HttpStatusCode.Unauthorized)

            call.respond(mapOf("id" to session.userId))
        }
    }
}

private fun Route.registerRouting(accountController: AccountController, threadLocalDigest: ThreadLocal<MessageDigest>) {
    post("/register") {
        call.respondText("Disabled", status = HttpStatusCode.Forbidden)
    }
    val database by injectDatabase()
    post("/register/{token}") { body: UnregisteredUserInfo ->
        val token = call.parameters["token"] ?: return@post call.respondText("Empty token", status = HttpStatusCode.BadRequest)
        val digest = threadLocalDigest.get()
        digest.update(token.toByteArray())
        database.updateInvite(digest.digest())
            .onSuccess {
                accountController.registerUser(body)
                    .onSuccess { authSession ->
                        call.sessions.set(authSession)
                        call.respond(UserId(authSession.userId))
                    }
                    .onFailure {
                        call.handleException(it)
                    }
            }.onFailure {
                call.handleException(it)
            }
    }
}

private suspend fun ApplicationCall.handleException(ex: Throwable) {
    when (ex) {
        is NoSuchUserException -> {
            respondText("No such user", status = HttpStatusCode.BadRequest)
        }

        is AuthFailedException -> {
            respondText("Wrong username or password", status = HttpStatusCode.BadRequest)
        }

        is RegistrationFailedException -> {
            respondText(ex.message ?: "User data conflict", status = HttpStatusCode.Conflict)
        }

        is MissingElementException -> { //TODO(makselivanov) change it?
            respondText(ex.message ?: "No such invite", status = HttpStatusCode.BadRequest)
        }

        else -> {
            defaultExceptionHandler(ex)
        }
    }
}
