package org.tod87et.roomkn.server.di

import io.ktor.server.routing.Route
import org.koin.ktor.ext.inject
import org.tod87et.roomkn.server.database.Database

fun Route.injectDatabase() = inject<Database>()
