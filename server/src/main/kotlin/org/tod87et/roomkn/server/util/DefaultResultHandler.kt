package org.tod87et.roomkn.server.util

import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.respond

suspend fun <T> Result<T>.okResponse(
    call: ApplicationCall,
    handleException: suspend ApplicationCall.(Throwable) -> Unit
) {
    this
        .onSuccess {
            call.respond("Ok")
        }
        .onFailure {
            call.handleException(it)
        }
}