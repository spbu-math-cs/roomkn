package org.tod87et.roomkn.server.plugins

import io.ktor.server.application.Application
import org.koin.ktor.ext.inject
import org.tod87et.roomkn.server.database.Database

fun Application.configureMap() {
    val database: Database by inject()
    database.createDefaultMap()
}