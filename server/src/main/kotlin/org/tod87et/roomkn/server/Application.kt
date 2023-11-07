package org.tod87et.roomkn.server

import io.ktor.server.application.Application
import org.tod87et.roomkn.server.auth.AccountControllerImpl
import org.tod87et.roomkn.server.auth.AuthConfigFactory
import org.tod87et.roomkn.server.plugins.configureAuthentication
import org.tod87et.roomkn.server.plugins.configureCORS
import org.tod87et.roomkn.server.plugins.configureCleanup
import org.tod87et.roomkn.server.plugins.configureRouting
import org.tod87et.roomkn.server.plugins.configureSerialization

@Suppress("UNUSED") // Used through kTor modules in application.conf
fun Application.module() {
    val authConfig = AuthConfigFactory.createConfig(environment)
    val accountController = AccountControllerImpl(environment.log, authConfig)
    accountController.createZeroAdminIfRequested()

    configureAuthentication(authConfig, accountController)
    configureCORS()
    configureRouting(accountController)
    configureSerialization()
    configureCleanup(accountController)
}
