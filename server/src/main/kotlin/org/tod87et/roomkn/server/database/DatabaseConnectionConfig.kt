package org.tod87et.roomkn.server.database

import kotlin.time.Duration
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds

sealed interface DatabaseConnectionConfig {
    class Url(
        val url: String,
        val driver: String = DB_DRIVER_DEFAULT,
        val user: String,
        val password: String,
        val connectRetryAttempts: Int = DB_CONNECT_RETRY_ATTEMPTS_DEFAULT,
        val connectRetryInitInterval: Duration = DB_CONNECT_RETRY_INIT_INTERVAL_DEFAULT,
    ) : DatabaseConnectionConfig {
        companion object {
            fun fromEnvironment(): Url {
                val databaseAddress = System.getenv(DB_URL)
                val databaseDriver = System.getenv(DB_DRIVER) ?: DB_DRIVER_DEFAULT
                val databaseUser = System.getenv(DB_USER).orEmpty()
                val databasePassword = System.getenv(DB_PASSWORD).orEmpty()
                val connectRetryAttempts = System.getenv(DB_CONNECT_RETRY_ATTEMPTS)
                    ?.toIntOrNull()?.takeIf { it > 0 } ?: DB_CONNECT_RETRY_ATTEMPTS_DEFAULT
                val connectInitInterval = System.getenv(DB_CONNECT_RETRY_INIT_INTERVAL)
                    ?.toLongOrNull()?.takeIf { it > 0 }?.milliseconds ?: DB_CONNECT_RETRY_INIT_INTERVAL_DEFAULT

                return Url(
                    databaseAddress,
                    databaseDriver,
                    databaseUser,
                    databasePassword,
                    connectRetryAttempts,
                    connectInitInterval
                )
            }

            private const val DB_URL = "DB_URL"
            private const val DB_DRIVER = "DB_DRIVER"
            private const val DB_USER = "DB_USER"
            private const val DB_PASSWORD = "DB_PASSWORD"
            private const val DB_CONNECT_RETRY_ATTEMPTS = "DB_CONNECT_RETRY_ATTEMPTS"
            private const val DB_CONNECT_RETRY_INIT_INTERVAL = "DB_CONNECT_RETRY_INIT_INTERVAL"

            private const val DB_DRIVER_DEFAULT = "org.postgresql.Driver"
            private const val DB_CONNECT_RETRY_ATTEMPTS_DEFAULT = 5
            private val DB_CONNECT_RETRY_INIT_INTERVAL_DEFAULT = 0.5.seconds
        }
    }

    data object EmbeddedDatabase : DatabaseConnectionConfig
}