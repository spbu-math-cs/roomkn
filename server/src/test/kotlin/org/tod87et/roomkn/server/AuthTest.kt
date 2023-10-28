package org.tod87et.roomkn.server

import io.ktor.client.call.body
import io.ktor.client.plugins.cookies.cookies
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.tod87et.roomkn.server.KtorTestEnv.testJsonApplication
import org.tod87et.roomkn.server.database.DatabaseFactory
import org.tod87et.roomkn.server.models.users.LoginUserInfo
import org.tod87et.roomkn.server.models.users.UnregisteredUserInfo
import kotlin.test.assertContains
import kotlin.test.assertEquals

class AuthTest {
    private val apiPath = "/api/v0"
    private val registerPath = "$apiPath/register"
    private val loginPath = "$apiPath/login"
    private val logoutPath = "$apiPath/logout"
    private val validatePath = "$apiPath/auth/validate-token"

    private val accountManager = KtorTestEnv.accountManager

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

    @Test
    fun logout() = testJsonApplication {  client ->
        accountManager.registerUser(
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

        val response = client.delete(logoutPath)
        assertEquals(HttpStatusCode.OK, response.status)

        val validate = client.get(validatePath)
        assertEquals(HttpStatusCode.Unauthorized, validate.status)
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