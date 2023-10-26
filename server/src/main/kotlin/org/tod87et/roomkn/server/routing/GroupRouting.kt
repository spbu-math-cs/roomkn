package org.tod87et.roomkn.server.routing

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import org.tod87et.roomkn.server.database.DatabaseFactory.database
import org.tod87et.roomkn.server.database.MissingElementException
import org.tod87et.roomkn.server.models.groups.NewGroup

fun Route.groupRouting() {
    route("groups") {
        createGroup()
        groups()
        groupById()
    }
}

private fun Route.createGroup() = post { newGroup: NewGroup ->
    //TODO Check permission from cookie
    val result = database.createGroup(newGroup)
    result.onSuccess {
        call.respond(HttpStatusCode.Created, it)
    }.onFailure {
        call.handleException(it)
    }
}

private fun Route.groups() = get {
    val result = database.getGroups()
    result.onSuccess {
        call.respond(HttpStatusCode.OK, it)
    }.onFailure {
        call.handleException(it)
    }
}

private fun Route.groupById() = get("/{id}") {
    val id = call.parameters["id"]?.toIntOrNull() ?: return@get call.respondText(
        "Id should be int",
        status = HttpStatusCode.BadRequest
    )
    val result = database.getGroup(id)
    result.onSuccess {
        call.respond(HttpStatusCode.OK, it)
    }.onFailure {
        call.handleException(it)
    }
}

private suspend fun ApplicationCall.handleException(ex: Throwable) {
    when (ex) {
        is MissingElementException -> {
            respondText(ex.message ?: "", status = HttpStatusCode.NotFound)
        }

        else -> {
            // Unknown exception, we rethrow to use kTor default exception handling
            // (response with 500 code and log stack trace)
            throw ex
        }
    }
}