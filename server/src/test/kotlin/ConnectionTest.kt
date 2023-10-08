import io.ktor.client.HttpClient
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.get
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.testing.ApplicationTestBuilder
import io.ktor.server.testing.testApplication
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.tod87et.roomkn.server.database.DatabaseFactory
import kotlin.test.assertEquals

class ConnectionTest {
    private val apiPath = "/api/v0"
    private val pingPath = "$apiPath/ping"

    private inline fun testJsonApplication(crossinline body: suspend ApplicationTestBuilder.(HttpClient) -> Unit) = testApplication {
        val client = createClient {
            install(ContentNegotiation) {
                json()
            }
        }

        body(client)
    }

    @Test
    fun ping() = testApplication {
        val response = client.get(pingPath)
        assertEquals(HttpStatusCode.OK, response.status)
    }

    @AfterEach
    fun clearTestDatabase() {
        // FIXME when clear is ready, bring it back
        // DatabaseFactory.database.clear()
    }

    companion object {
        @JvmStatic
        @BeforeAll
        fun connectToTestDatabase() {
            DatabaseFactory.initEmbedded()
        }
    }
}