package org.tod87et.roomkn.server

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.cors.routing.*
import org.tod87et.roomkn.server.plugins.configureRouting
import org.tod87et.roomkn.server.plugins.configureSerialization

fun Application.module() {
    install(CORS) {
        anyHost()
        allowHeader("X-Requested-With")
        allowHeader(HttpHeaders.Origin)
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.AccessControlAllowOrigin)
        allowHeader(HttpHeaders.AccessControlAllowMethods)
        allowHeader(HttpHeaders.AccessControlAllowHeaders)
        allowCredentials = true
    }
    configureRouting()
    configureSerialization()
}
