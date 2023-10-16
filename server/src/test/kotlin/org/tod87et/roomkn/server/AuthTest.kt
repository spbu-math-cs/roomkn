package org.tod87et.roomkn.server

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.cookies.HttpCookies
import io.ktor.client.plugins.cookies.cookies
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.testing.ApplicationTestBuilder
import io.ktor.server.testing.testApplication
import org.jetbrains.exposed.sql.exposedLogger
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.tod87et.roomkn.server.auth.AccountControllerImpl
import org.tod87et.roomkn.server.auth.AuthConfig
import org.tod87et.roomkn.server.database.DatabaseFactory
import org.tod87et.roomkn.server.models.LoginUserInfo
import org.tod87et.roomkn.server.models.UnregisteredUserInfo
import kotlin.test.assertContains
import kotlin.test.assertEquals

class AuthTest {
    private val apiPath = "/api/v0"
    private val registerPath = "$apiPath/register"
    private val loginPath = "$apiPath/login"
    private val validatePath = "$apiPath/auth/validate-token"

    private val accountManager = AccountControllerImpl(
        exposedLogger,
        AuthConfig.Builder()
            .database(DatabaseFactory.credentialsDatabase)
            .pepper(System.getenv("PEPPER"))
            .secret(System.getenv("JWT_SECRET"))
            .issuer("http://127.0.0.1:8080/")
            .audience("http://127.0.0.1:8080/api/v0/login")
            .build()
    )

    private inline fun testJsonApplication(crossinline body: suspend ApplicationTestBuilder.(HttpClient) -> Unit) =
        testApplication {
            val client = createClient {
                install(ContentNegotiation) {
                    json()
                }
                install(HttpCookies)
            }

            body(client)
        }

    @Test
    fun register() = testJsonApplication { client ->
        val response = client.post(registerPath) {
            contentType(ContentType.Application.Json)
            setBody(
                UnregisteredUserInfo(
                    "Root",
                    "root@example.org",
                    "the-root-of-evil"
                )
            )
        }
        assertEquals(HttpStatusCode.OK, response.status)
        assertContains(client.cookies("/").map { it.name }, "auth_session")
    }

    @Test
    fun registerFailure() = testJsonApplication {  client ->
        accountManager.registerUser(
            UnregisteredUserInfo(
                "Root",
                "root@example.org",
                "the-root-of-evil"
            )
        )

        val response = client.post(registerPath) {
            contentType(ContentType.Application.Json)
            setBody(
                UnregisteredUserInfo(
                    "RootBond",
                    "root@example.org",
                    "007"
                )
            )
        }

        assertEquals(HttpStatusCode.Conflict, response.status)
    }

    @Test
    fun login() = testJsonApplication {  client ->
        accountManager.registerUser(
            UnregisteredUserInfo(
                "Root",
                "root@example.org",
                "the-root-of-evil"
            )
        )

        client.post(loginPath) {
            contentType(ContentType.Application.Json)
            setBody(
                LoginUserInfo(
                    "Root",
                    "the-root-of-evil"
                )
            )
        }

        assertContains(client.cookies("/").map { it.name }, "auth_session")
    }

    @Test
    fun validateToken() = testJsonApplication {  client ->
        val session = accountManager.registerUser(
            UnregisteredUserInfo(
                "Root",
                "root@example.org",
                "the-root-of-evil"
            )
        ).getOrThrow()

        client.post(loginPath) {
            contentType(ContentType.Application.Json)
            setBody(
                LoginUserInfo(
                    "Root",
                    "the-root-of-evil"
                )
            )
        }

        val response = client.get(validatePath)

        assertEquals(session.userId, response.body<Map<String, Int>>()["id"])
    }

    @AfterEach
    fun clearTestDatabase() {
        DatabaseFactory.database.clear()
    }

    companion object {
        @JvmStatic
        @BeforeAll
        fun connectToTestDatabase() {
            DatabaseFactory.initEmbedded()
        }
    }
}