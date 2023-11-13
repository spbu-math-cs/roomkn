package org.tod87et.roomkn.server.auth.di

import io.ktor.server.application.ApplicationEnvironment
import io.ktor.util.logging.Logger
import org.koin.core.module.Module
import org.koin.dsl.module
import org.tod87et.roomkn.server.di.Di
import org.tod87et.roomkn.server.auth.AccountController
import org.tod87et.roomkn.server.auth.AccountControllerImpl
import org.tod87et.roomkn.server.auth.AuthConfig
import org.tod87et.roomkn.server.database.CredentialsDatabase
import org.tod87et.roomkn.server.database.Database

@Suppress("UnusedReceiverParameter")
val Di.authModule: Module get() = module

private val module: Module = module {
    single<AuthConfig> {
        AuthConfig.Builder()
            .loadEnvironment(get<ApplicationEnvironment>())
            .database(get<Database>())
            .credentialsDatabase(get<CredentialsDatabase>())
            .build()
    }

    single<AccountController> {
        AccountControllerImpl(get<Logger>(), get<AuthConfig>())
    }
}
