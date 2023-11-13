package org.tod87et.roomkn.server.plugins

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.auth.Authentication
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.jwt.jwt
import io.ktor.server.auth.session
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.sessions.Sessions
import io.ktor.server.sessions.cookie
import org.koin.ktor.ext.inject
import org.tod87et.roomkn.server.auth.AccountController
import org.tod87et.roomkn.server.auth.AuthConfig
import org.tod87et.roomkn.server.auth.AuthSession
import org.tod87et.roomkn.server.auth.AuthenticationProvider

fun Application.configureAuthentication() {
    val authConfig: AuthConfig by inject()
    val accountController: AccountController by inject()

    val realm = environment.config.property("jwt.realm").getString()

    accountController.createZeroAdminIfRequested()

    install(Sessions) {
        cookie<AuthSession>("auth_session") {
            cookie.path = "/"
            cookie.maxAgeInSeconds = authConfig.tokenValidityPeriod.inWholeSeconds
        }
    }

    install(Authentication) {
        session<AuthSession>(AuthenticationProvider.SESSION) {
            validate { session ->
                if (accountController.validateSession(session).getOrNull() == true) {
                    session
                } else {
                    null
                }
            }
            challenge {
                call.respondText("Unauthorized", status = HttpStatusCode.Unauthorized)
            }
        }
        jwt(AuthenticationProvider.JWT) {
            this.realm = realm

            verifier(accountController.jwtVerifier)

            validate { credential ->
                if (credential.payload.getClaim(AuthSession.USER_ID_CLAIM_NAME).asInt() != null) {
                    JWTPrincipal(credential.payload)
                } else {
                    null
                }
            }

            challenge { _, _ ->
                call.respond(HttpStatusCode.Unauthorized, "Token is not valid or has expired")
            }
        }
    }
}
