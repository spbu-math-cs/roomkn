package org.tod87et.roomkn.server.database

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres
import java.util.concurrent.atomic.AtomicReference
import kotlin.concurrent.thread

object DatabaseFactory {
    private val databaseRef = AtomicReference<Db?>(null)

    val database: Db get() = databaseRef.get()!!

    fun init() {
        val databaseAddress = System.getenv("DB_URL")
        val databaseDriver = System.getenv("DB_DRIVER") ?: "org.postgresql.Driver"
        val databaseUser = System.getenv("DB_USER") ?: ""
        val databasePassword = System.getenv("DB_PASSWORD") ?: ""

        if (databaseAddress == null) {
            val embeddedPostgres = EmbeddedPostgres.start()
            val dataSource = embeddedPostgres.postgresDatabase
            if (databaseRef.compareAndSet(null, Db(dataSource))) {
                Runtime.getRuntime().addShutdownHook(
                    thread(start = false) {
                        embeddedPostgres.close()
                    }
                )
            } else {
                embeddedPostgres.close()
            }
        } else {
            databaseRef.compareAndSet(
                null,
                Db(
                    url = databaseAddress,
                    driver = databaseDriver,
                    user = databaseUser,
                    password = databasePassword,
                )
            )
        }
    }
}