package org.tod87et.roomkn.server.routing

import io.ktor.server.routing.Route
import io.ktor.server.routing.route
import org.tod87et.roomkn.server.auth.AuthConfig

fun Route.apiRouting(authConfig: AuthConfig) {
    route("/api/v0") {
        pingRouting()
        reserveRouting()
        roomsRouting()
        accountRouting(authConfig)
        groupRouting()
    }
}
