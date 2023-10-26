package org.tod87et.roomkn.server

import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.zonky.test.db.postgres.embedded.EmbeddedPostgres
import javax.sql.DataSource
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.tod87et.roomkn.server.KtorTestEnv.testJsonApplication
import org.tod87et.roomkn.server.database.DatabaseFactory
import org.tod87et.roomkn.server.database.DatabaseSession
import org.tod87et.roomkn.server.models.groups.Group
import org.tod87et.roomkn.server.models.groups.NewGroup
import kotlin.test.assertContentEquals
import kotlin.test.assertEquals

class RoutingTest {
    private val apiPath = "/api/v0"
    private val groupsPath = "$apiPath/groups"
    //TODO add tests for all routing

    @Test
    fun group() = testJsonApplication { client ->
        val usersId = listOf(1, 2, 3, 4, 5)
        var response = client.post(groupsPath) {
            contentType(ContentType.Application.Json)
            setBody(
                NewGroup("Group 1", usersId)
            )
        }
        assertEquals(HttpStatusCode.Created, response.status)
        val group = response.body<Group>()
        response = client.get(groupsPath)
        assertEquals(HttpStatusCode.OK, response.status)
        val list = response.body<List<Group>>()
        assertContentEquals(listOf(group), list)
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