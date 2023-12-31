package org.tod87et.roomkn.server

import io.ktor.server.application.Application
import io.ktor.util.logging.KtorSimpleLogger
import org.tod87et.roomkn.server.plugins.configureAuthentication
import org.tod87et.roomkn.server.plugins.configureCleanup
import org.tod87et.roomkn.server.plugins.configureCallLogging
import org.tod87et.roomkn.server.plugins.configureMap
import org.tod87et.roomkn.server.plugins.configureMetrics
import org.tod87et.roomkn.server.plugins.configureRouting
import org.tod87et.roomkn.server.plugins.configureSerialization

@Suppress("UNUSED") // Used through kTor modules in application.conf
fun Application.module() {
    val logger = KtorSimpleLogger("RooMKN")

    logger.info("Initializing RooMKN main module...")
    configureAuthentication()
    configureRouting()
    configureSerialization()
    configureCleanup()
    configureCallLogging()
    configureMap()
    configureMetrics()
    logger.info("RooMKN main module has been initialized")
}
