package org.tod87et.roomkn.server.plugins

import io.ktor.server.application.Application
import io.ktor.server.routing.routing
import org.tod87et.roomkn.server.auth.AuthConfig
import org.tod87et.roomkn.server.routing.apiRouting


fun Application.configureRouting(authConfig: AuthConfig) {
    routing {
        apiRouting(authConfig)
    }
}
