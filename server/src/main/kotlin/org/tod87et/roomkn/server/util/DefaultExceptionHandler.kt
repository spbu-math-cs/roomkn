package org.tod87et.roomkn.server.util

import io.ktor.server.application.ApplicationCall


@Suppress("UnusedReceiverParameter")
fun ApplicationCall.defaultExceptionHandler(ex: Throwable) {
    // Unknown exception, we rethrow to use kTor default exception handling
    // (response with 500 code and log stack trace)
    throw ex
}
