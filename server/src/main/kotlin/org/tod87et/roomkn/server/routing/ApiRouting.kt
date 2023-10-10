package org.tod87et.roomkn.server.routing

import io.ktor.server.routing.Route
import io.ktor.server.routing.route
import org.tod87et.roomkn.server.database.DatabaseFactory

private val database get() = DatabaseFactory.database
fun Route.apiRouting() {
    route("/api/v0") {
        pingRouting()
        room()
        reserve()
    }
}
