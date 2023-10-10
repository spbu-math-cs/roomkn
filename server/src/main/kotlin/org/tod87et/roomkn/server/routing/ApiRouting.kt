package org.tod87et.roomkn.server.routing

import io.ktor.server.routing.Route
import io.ktor.server.routing.route

fun Route.apiRouting() {
    route("/api/v0") {
        pingRouting()
        room()
    }
}
