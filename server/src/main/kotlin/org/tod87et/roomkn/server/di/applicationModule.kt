package org.tod87et.roomkn.server.di

import io.ktor.server.application.ApplicationEnvironment
import io.ktor.util.logging.Logger
import org.koin.core.module.Module
import org.koin.dsl.module

@Suppress("UnusedReceiverParameter")
fun Di.applicationModule(environment: ApplicationEnvironment): Module = module {
    single<ApplicationEnvironment> { environment }
    single<Logger> { get<ApplicationEnvironment>().log }
}
