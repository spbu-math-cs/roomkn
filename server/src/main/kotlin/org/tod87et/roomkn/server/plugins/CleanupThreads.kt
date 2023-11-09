package org.tod87et.roomkn.server.plugins

import io.ktor.server.application.Application
import org.tod87et.roomkn.server.auth.AccountController
import kotlin.concurrent.thread

fun Application.configureCleanup(accountController: AccountController) {
    accountController.startCleanupThread()
    Runtime.getRuntime().addShutdownHook(
        thread(start = false) {
            accountController.stopCleanupThread()
        }
    )
}
