package org.tod87et.roomkn.server

import io.ktor.client.HttpClient
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.testing.ApplicationTestBuilder
import io.ktor.server.testing.testApplication
import kotlinx.datetime.Instant
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeAll
import org.tod87et.roomkn.server.database.DatabaseFactory
import org.tod87et.roomkn.server.models.Reservation
import kotlin.test.Test
import kotlin.test.assertEquals


class ServerTest {
    private val apiPath = "/api/v0"
    private val reservePath = "$apiPath/reserve"

    private inline fun testJsonApplication(crossinline body: suspend ApplicationTestBuilder.(HttpClient) -> Unit) = testApplication {
        val client = createClient {
            install(ContentNegotiation) {
                json()
            }
        }

        body(client)
    }

    @Test
    fun checkReserve() = testJsonApplication { client->
        val user = DatabaseFactory.database.registerUser("user", "abc@mail.org")
        val room = DatabaseFactory.database.createRoom("room", "desc")

        val response = client.post(reservePath) {
            contentType(ContentType.Application.Json)
            setBody(
                Reservation(
                    user.id,
                    Instant.fromEpochMilliseconds(0),
                    Instant.fromEpochMilliseconds(100),
                    room.id
                )
            )
        }
        assertEquals(HttpStatusCode.OK, response.status)

        val response2 = client.post(reservePath) {
            contentType(ContentType.Application.Json)
            setBody(
                Reservation(
                    user.id,
                    Instant.fromEpochMilliseconds(50),
                    Instant.fromEpochMilliseconds(150),
                    room.id
                )
            )
        }
        assertEquals(HttpStatusCode.Conflict, response2.status)

        val response3 = client.post(reservePath) {
            contentType(ContentType.Application.Json)
            setBody(listOf<Int>())
        }
        assertEquals(HttpStatusCode.BadRequest, response3.status)

        val response4 = client.post(reservePath) {
            contentType(ContentType.Application.Json)
            setBody(
                Reservation(
                    user.id,
                    Instant.fromEpochMilliseconds(250),
                    Instant.fromEpochMilliseconds(150),
                    room.id
                )
            )
        }
        assertEquals(HttpStatusCode.BadRequest, response4.status)
    }

    @AfterEach
    fun clearTestDatabase() {
//        DatabaseFactory.database.clear()
    }

    companion object {
        @JvmStatic
        @BeforeAll
        fun connectToTestDatabase() {
            DatabaseFactory.init()
        }
    }
}
