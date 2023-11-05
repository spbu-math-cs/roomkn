package org.tod87et.roomkn.server

import io.ktor.client.request.get
import io.ktor.http.HttpStatusCode
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.tod87et.roomkn.server.KtorTestEnv.testJsonApplication
import kotlin.test.assertEquals

class ConnectionTest {
    private val apiPath = "/api/v0"
    private val pingPath = "$apiPath/ping"

    @Test
    fun ping() = testJsonApplication {
        val response = client.get(pingPath)
        assertEquals(HttpStatusCode.OK, response.status)
    }

    companion object {
        @JvmStatic
        @BeforeAll
        fun connectToTestDatabase() {
            KtorTestEnv.resetDatabase()
        }
    }
}