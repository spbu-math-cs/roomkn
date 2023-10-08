package org.tod87et.roomkn.server

import io.ktor.server.application.Application
import org.tod87et.roomkn.server.plugins.configureCORS
import org.tod87et.roomkn.server.plugins.configureRouting
import org.tod87et.roomkn.server.plugins.configureSerialization

fun Application.module() {
    configureCORS()
    configureRouting()
    configureSerialization()
}
