package org.tod87et.roomkn.server.plugins

import io.ktor.server.application.Application
import io.ktor.server.application.install
import org.koin.ktor.plugin.Koin
import org.tod87et.roomkn.server.auth.di.authModule
import org.tod87et.roomkn.server.database.di.databaseModule
import org.tod87et.roomkn.server.di.Di
import org.tod87et.roomkn.server.di.applicationModule

@Suppress("UNUSED") // Used through kTor modules in application.conf
fun Application.koinModule() {
    install(Koin) {
        with(Di) {
            modules(applicationModule(environment), databaseModule, authModule)
        }
    }
}
