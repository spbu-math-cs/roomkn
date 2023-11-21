package org.tod87et.roomkn.server.plugins

import io.ktor.server.application.Application
import kotlinx.coroutines.launch
import org.koin.ktor.ext.inject
import org.tod87et.roomkn.server.auth.AccountController

fun Application.configureCleanup() {
    val accountController: AccountController by inject()
    launch {
        accountController.cleanerLoop()
    }
}
