package org.tod87et.roomkn.server.routing

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.respondText


suspend fun ApplicationCall.onMissingPermission() {
    respondText("Missing permission", status = HttpStatusCode.Forbidden)
}

suspend fun ApplicationCall.onMissingId() {
    respondText("id should be int", status = HttpStatusCode.BadRequest)
}

suspend fun ApplicationCall.onIncorrectTimestamp() {
    respondText("timestamp should be correct Instant", status = HttpStatusCode.BadRequest)
}
