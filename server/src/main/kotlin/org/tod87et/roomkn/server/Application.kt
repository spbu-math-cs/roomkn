package org.tod87et.roomkn.server

import io.ktor.server.application.Application
import org.tod87et.roomkn.server.plugins.configureAuthentication
import org.tod87et.roomkn.server.plugins.configureCORS
import org.tod87et.roomkn.server.plugins.configureCleanup
import org.tod87et.roomkn.server.plugins.configureRouting
import org.tod87et.roomkn.server.plugins.configureSerialization

@Suppress("UNUSED") // Used through kTor modules in application.conf
fun Application.module() {
    configureAuthentication()
    configureCORS()
    configureRouting()
    configureSerialization()
    configureCleanup()
}
