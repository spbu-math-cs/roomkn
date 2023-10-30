package org.tod87et.roomkn.server

import io.ktor.client.HttpClient
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.cookies.HttpCookies
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.config.ApplicationConfig
import io.ktor.server.config.tryGetString
import io.ktor.server.testing.ApplicationTestBuilder
import io.ktor.server.testing.testApplication
import org.jetbrains.exposed.sql.exposedLogger
import org.tod87et.roomkn.server.auth.AccountControllerImpl
import org.tod87et.roomkn.server.auth.AuthConfig
import org.tod87et.roomkn.server.database.DatabaseFactory


object KtorTestEnv {
    private val kTorConfig = ApplicationConfig("dev.conf")
    val accountManager = AccountControllerImpl(
        exposedLogger,
        AuthConfig.Builder()
            .database(DatabaseFactory.database)
            .credentialsDatabase(DatabaseFactory.credentialsDatabase)
            .pepper(kTorConfig.tryGetString("auth.pepper")!!)
            .secret(kTorConfig.tryGetString("jwt.secret")!!)
            .issuer(kTorConfig.tryGetString("jwt.issuer")!!)
            .audience(kTorConfig.tryGetString("jwt.audience")!!)
            .build()
    )

    fun testJsonApplication(body: suspend ApplicationTestBuilder.(HttpClient) -> Unit) =
        testApplication {
            environment {
                config = kTorConfig

            }
            val client = createClient {
                install(ContentNegotiation) {
                    json()
                }
                install(HttpCookies)
            }

            body(client)
        }
}
