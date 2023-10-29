package org.tod87et.roomkn.server.plugins

import io.ktor.server.application.Application
import io.ktor.server.routing.routing
import org.tod87et.roomkn.server.auth.AccountController
import org.tod87et.roomkn.server.routing.apiRouting


fun Application.configureRouting(accountController: AccountController) {
    routing {
        apiRouting(accountController)
    }
}
