package org.tod87et.roomkn.server.database.di

import io.ktor.util.logging.KtorSimpleLogger
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
import org.tod87et.roomkn.server.util.retryAction

@Suppress("UnusedReceiverParameter")
val Di.databaseModule: Module get() = module

private val kTorLogger = KtorSimpleLogger("DB_DI")

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
                retryAction(
                    config.connectRetryAttempts,
                    config.connectRetryInitInterval,
                    onErrorAction = { idx, ex ->
                        kTorLogger.warn(
                            "Failed to connect to the DB, attempt ${idx + 1}/${config.connectRetryAttempts}",
                            ex
                        )
                    }
                ) {
                    DatabaseSession(config.url, config.driver, config.user, config.password)
                }
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
