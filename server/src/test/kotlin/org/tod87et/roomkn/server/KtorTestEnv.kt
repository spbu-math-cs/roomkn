package org.tod87et.roomkn.server

import io.ktor.client.HttpClient
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.cookies.HttpCookies
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.config.ApplicationConfig
import io.ktor.server.config.tryGetString
import io.ktor.server.testing.ApplicationTestBuilder
import io.ktor.server.testing.testApplication
import org.jetbrains.exposed.sql.exposedLogger
import org.tod87et.roomkn.server.auth.AccountControllerImpl
import org.tod87et.roomkn.server.auth.AuthConfig
import org.tod87et.roomkn.server.auth.userId
import org.tod87et.roomkn.server.database.DatabaseFactory
import org.tod87et.roomkn.server.models.permissions.UserPermission
import org.tod87et.roomkn.server.models.users.LoginUserInfo
import org.tod87et.roomkn.server.models.users.UnregisteredUserInfo
import kotlin.test.assertEquals


object KtorTestEnv {
    const val API_PATH = "/api/v0"
    const val LOGIN_PATH = "$API_PATH/login"

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


    suspend fun HttpClient.createAndAuthAdmin(name: String = "Root", password: String = "the-root-of-evil") {
        createAndAuthUser(
            name,
            password,
            listOf(
                UserPermission.UsersAdmin,
                UserPermission.ReservationsAdmin,
                UserPermission.ReservationsAdmin,
            )
        )
    }

    fun createUser(name: String, password: String = "qwerty"): Int {
        val initialSession = accountManager.registerUser(UnregisteredUserInfo(name, "$name@example.org", password))
            .getOrThrow()
        DatabaseFactory.database.updateUserPermissions(
            initialSession.userId,
            listOf(UserPermission.ReservationsCreate)
        ).getOrThrow()

        return initialSession.userId
    }

    suspend fun HttpClient.createAndAuthUser(
        name: String = "Alice",
        password: String = "qwerty",
        permissions: List<UserPermission> = listOf(UserPermission.ReservationsCreate)
    ) {
        val initialSession = accountManager.registerUser(UnregisteredUserInfo(name, "$name@example.org", password))
            .getOrThrow()
        DatabaseFactory.database.updateUserPermissions(
            initialSession.userId,
            permissions
        ).getOrThrow()

        val auth = post(LOGIN_PATH) {
            contentType(ContentType.Application.Json)
            setBody(LoginUserInfo(name, password))
        }
        assertEquals(HttpStatusCode.OK, auth.status)
    }
}
