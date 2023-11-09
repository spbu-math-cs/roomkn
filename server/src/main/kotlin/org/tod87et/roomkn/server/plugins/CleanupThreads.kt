package org.tod87et.roomkn.server.plugins

import io.ktor.server.application.Application
import kotlinx.coroutines.launch
import org.tod87et.roomkn.server.auth.AccountController

fun Application.configureCleanup(accountController: AccountController) {
    launch {
        accountController.cleanerLoop()
    }
}
