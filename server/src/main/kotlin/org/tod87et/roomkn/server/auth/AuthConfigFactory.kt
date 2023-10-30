package org.tod87et.roomkn.server.auth

import io.ktor.server.application.ApplicationEnvironment
import org.tod87et.roomkn.server.database.DatabaseFactory

object AuthConfigFactory {
    fun createConfig(environment: ApplicationEnvironment): AuthConfig {
        return AuthConfig.Builder()
            .loadEnvironment(environment)
            .database(DatabaseFactory.database)
            .credentialsDatabase(DatabaseFactory.credentialsDatabase)
            .build()
    }
}