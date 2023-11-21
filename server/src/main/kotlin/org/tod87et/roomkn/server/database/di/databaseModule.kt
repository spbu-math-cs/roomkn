package org.tod87et.roomkn.server.database.di

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres
import org.koin.core.module.Module
import org.koin.dsl.binds
import org.koin.dsl.module
import org.koin.dsl.onClose
import org.tod87et.roomkn.server.database.CredentialsDatabase
import org.tod87et.roomkn.server.database.Database
import org.tod87et.roomkn.server.database.DatabaseConnectionConfig
import org.tod87et.roomkn.server.database.DatabaseSession
import org.tod87et.roomkn.server.di.Di

@Suppress("UnusedReceiverParameter")
val Di.databaseModule: Module get() = module

private val module: Module = module {

    single<EmbeddedPostgres> {
        EmbeddedPostgres.start()
    } onClose {
        it?.close()
    }
    single<DatabaseConnectionConfig> {
        runCatching {
            DatabaseConnectionConfig.Url.fromEnvironment()
        }.getOrElse {
            DatabaseConnectionConfig.EmbeddedDatabase
        }
    }
    single<DatabaseSession> {
        when (val config = get<DatabaseConnectionConfig>()) {
            is DatabaseConnectionConfig.Url -> {
                DatabaseSession(config.url, config.driver, config.user, config.password)
            }

            is DatabaseConnectionConfig.EmbeddedDatabase -> {
                DatabaseSession(get<EmbeddedPostgres>().postgresDatabase)
            }
        }
    } binds arrayOf(
        Database::class,
        CredentialsDatabase::class
    )
}
