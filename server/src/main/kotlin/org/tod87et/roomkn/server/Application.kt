package org.tod87et.roomkn.server

import io.ktor.server.application.Application
import org.tod87et.roomkn.server.auth.AuthConfig
import org.tod87et.roomkn.server.database.DatabaseFactory
import org.tod87et.roomkn.server.plugins.configureAuthentication
import org.tod87et.roomkn.server.plugins.configureCORS
import org.tod87et.roomkn.server.plugins.configureRouting
import org.tod87et.roomkn.server.plugins.configureSerialization

fun Application.module() {
    val authConfig = AuthConfig.Builder()
        .loadEnvironment(environment)
        .database(DatabaseFactory.credentialsDatabase)
        .build()

    configureAuthentication(authConfig)
    configureCORS()
    configureRouting(authConfig)
    configureSerialization()
}
