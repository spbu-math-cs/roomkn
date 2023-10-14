package org.tod87et.roomkn.server.routing

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.principal
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.sessions.sessions
import io.ktor.server.sessions.set
import org.tod87et.roomkn.server.auth.AccountController
import org.tod87et.roomkn.server.auth.AccountControllerImpl
import org.tod87et.roomkn.server.auth.AuthConfig
import org.tod87et.roomkn.server.auth.AuthFailedException
import org.tod87et.roomkn.server.auth.AuthSession
import org.tod87et.roomkn.server.auth.AuthenticationProvider
import org.tod87et.roomkn.server.auth.NoSuchUserException
import org.tod87et.roomkn.server.auth.RegistrationFailedException
import org.tod87et.roomkn.server.models.LoginUserInfo
import org.tod87et.roomkn.server.models.UnregisteredUserInfo

fun Route.accountRouting(authConfig: AuthConfig) {
    val env = environment!!
    val accountController: AccountController = AccountControllerImpl(env.log, authConfig)

    loginRouting(accountController)
    validateTokenRouting()
    registerRouting(accountController)
}

private fun Route.loginRouting(accountController: AccountController) {
    post("/login") { body: LoginUserInfo ->
        accountController.authenticateUser(body)
            .onSuccess { authSession ->
                call.sessions.set(authSession)
                call.respondText("cookie has been installed")
            }
            .onFailure {
                call.handleException(it)
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

private fun Route.registerRouting(accountController: AccountController) {
    post("/register") { body: UnregisteredUserInfo ->
        accountController.registerUser(body)
            .onSuccess { authSession ->
                call.sessions.set(authSession)
                call.respondText("cookie has been installed")
            }
            .onFailure {
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

        else -> {
            throw ex
        }
    }
}
