package org.tod87et.roomkn.server

import io.ktor.client.call.body
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.tod87et.roomkn.server.database.DatabaseFactory
import org.tod87et.roomkn.server.models.rooms.NewRoomInfo
import org.tod87et.roomkn.server.models.rooms.RoomInfo
import org.tod87et.roomkn.server.models.rooms.ShortRoomInfo
import org.tod87et.roomkn.server.models.toCreated
import org.tod87et.roomkn.server.models.toShort
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class RoomsRoutesTests {
    private val apiPath = KtorTestEnv.API_PATH
    private val roomsPath = "$apiPath/rooms"
    private fun roomPath(id: Int) = "$roomsPath/$id"

    @Test
    fun getRooms() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthAdmin()
        }
        val room1 = createRoom("301", "The one with a broken desc(")
        val room2 = createRoom("Study room", "Ideal place to study at")
        val rooms = client.get(roomsPath).body<List<ShortRoomInfo>>()

        assertEquals(setOf(room1.toShort(), room2.toShort()), rooms.toSet())
    }

    @Test
    fun getRoom() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthUser()
        }
        val room = createRoom("A", "B")


        val room2 = client.get(roomPath(room.id)).body<RoomInfo>()
        assertEquals(room, room2)
    }

    @Test
    fun deleteRoom() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthAdmin()
        }
        val room = createRoom("A", "B")
        val shortRoom = room.toShort()
        assertTrue(DatabaseFactory.database.getRooms().getOrThrow().contains(shortRoom))

        val resp = client.delete(roomPath(room.id))
        assertEquals(HttpStatusCode.OK, resp.status)
        assertFalse(DatabaseFactory.database.getRooms().getOrThrow().contains(shortRoom))
    }

    @Test
    fun updateRoom() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthAdmin()
        }
        val room = createRoom("301", "VK -- the meeting point")
        val newRoom = NewRoomInfo("301", "Be kind, be friendly, be MCS")

        val resp = client.put(roomPath(room.id)) {
            contentType(ContentType.Application.Json)
            setBody(newRoom)
        }
        assertEquals(HttpStatusCode.OK, resp.status)
        assertEquals(
            DatabaseFactory.database.getRoom(room.id).getOrThrow(),
            newRoom.toCreated(room.id)
        )
    }

    private fun createRoom(name: String, desc: String = "Description of $name"): RoomInfo {
        return DatabaseFactory.database.createRoom(NewRoomInfo(name, desc)).getOrThrow()
    }

    @AfterEach
    fun clearTestDatabase() {
        DatabaseFactory.database.clear()
    }

    companion object {
        @JvmStatic
        @BeforeAll
        fun connectToTestDatabase() {
            KtorTestEnv.resetDatabase()
        }
    }
}