package org.tod87et.roomkn.server.database

sealed interface DatabaseConnectionConfig {
    class Url(
        val url: String,
        val driver: String,
        val user: String,
        val password: String
    ) : DatabaseConnectionConfig {
        companion object {
            fun fromEnvironment(): Url {
                val databaseAddress = System.getenv(DB_URL)
                val databaseDriver = System.getenv(DB_DRIVER) ?: DB_DRIVER_DEFAULT
                val databaseUser = System.getenv(DB_USER).orEmpty()
                val databasePassword = System.getenv(DB_PASSWORD).orEmpty()

                return Url(databaseAddress, databaseDriver, databaseUser, databasePassword)
            }

            private const val DB_URL = "DB_URL"
            private const val DB_DRIVER = "DB_DRIVER"
            private const val DB_USER = "DB_USER"
            private const val DB_PASSWORD = "DB_PASSWORD"

            private const val DB_DRIVER_DEFAULT = "org.postgresql.Driver"
        }
    }

    data object EmbeddedDatabase : DatabaseConnectionConfig
}