package org.tod87et.roomkn.server

import io.ktor.server.netty.EngineMain
import org.tod87et.roomkn.server.database.DatabaseFactory

fun main(args: Array<String>) {
    DatabaseFactory.init()
    EngineMain.main(args)
}
