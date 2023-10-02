package org.tod87et.roomkn.server.routing

import io.ktor.server.application.call
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.get

fun Route.pingRouting() {
    get("/ping") {
        call.respondText("Server is available")
    }
}
