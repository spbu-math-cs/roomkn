package org.tod87et.roomkn.server

import io.ktor.client.call.body
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.parameter
import io.ktor.client.request.patch
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import org.junit.jupiter.api.Test
import org.tod87et.roomkn.server.models.rooms.NewRoomInfo
import org.tod87et.roomkn.server.models.rooms.NewRoomInfoWithNull
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
    private val roomsShortPath = "$roomsPath/list-short"
    private fun roomPath(id: Int) = "$roomsPath/$id"
    private val mapPath = "$apiPath/map"

    @Test
    fun getRooms() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthAdmin()
        }
        val room1 = KtorTestEnv.createRoom("301", "The one with a broken desk(")
        val room2 = KtorTestEnv.createRoom("Study room", "Ideal place to study at")
        val rooms = client.get(roomsPath).body<List<ShortRoomInfo>>()

        assertEquals(setOf(room1.toShort(), room2.toShort()), rooms.toSet())
    }

    @Test
    fun getRoomsShort() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthAdmin()
        }
        val room1 = KtorTestEnv.createRoom("301", "Has a whiteboard")
        val room2 = KtorTestEnv.createRoom("Study room", "Ideal place to study at")
        KtorTestEnv.createRoom("302", "No way it can really have a number...")
        val rooms = client.get(roomsShortPath) {
            parameter("ids", listOf(room1.id, room2.id).joinToString(","))
        }
        assertEquals(HttpStatusCode.OK, rooms.status)


        assertEquals(setOf(room1.toShort(), room2.toShort()), rooms.body<List<ShortRoomInfo>>().toSet())
    }

    @Test
    fun getRoom() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthUser()
        }
        val room = KtorTestEnv.createRoom("A", "B")


        val room2 = client.get(roomPath(room.id)).body<RoomInfo>()
        assertEquals(room, room2)
    }

    @Test
    fun UpdateMapWithRegularClient() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthUser()
        }
        val newMap = "This is Map from user, don't trust me"
        val putResponse = client.put(mapPath) {
            setBody(newMap)
        }
        assertEquals(HttpStatusCode.Forbidden, putResponse.status)
    }

    @Test
    fun getAndUpdateMap() = KtorTestEnv.testJsonApplication { client ->
        val errorResponse = client.get(mapPath)
        assertEquals(HttpStatusCode.Unauthorized, errorResponse.status)
        with(KtorTestEnv) {
            client.createAndAuthAdmin()
        }
        val emptyResponse = client.get(mapPath)
        assertEquals(HttpStatusCode.OK, emptyResponse.status)
        assertEquals("{}", emptyResponse.bodyAsText())
        val newMap = "This is Map, trust me"
        val putResponse = client.put(mapPath) {
            setBody(newMap)
        }
        assertEquals(HttpStatusCode.OK, putResponse.status)
        val response = client.get(mapPath)
        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals(newMap, response.bodyAsText())
    }

    @Test
    fun deleteRoom() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthAdmin()
        }
        val room = KtorTestEnv.createRoom("A", "B")
        val shortRoom = room.toShort()
        assertTrue(KtorTestEnv.database.getRooms().getOrThrow().contains(shortRoom))

        val resp = client.delete(roomPath(room.id))
        assertEquals(HttpStatusCode.OK, resp.status)
        assertFalse(KtorTestEnv.database.getRooms().getOrThrow().contains(shortRoom))
    }

    @Test
    fun updateRoom() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthAdmin()
        }
        val room = KtorTestEnv.createRoom("301", "VK -- the meeting point")
        val newRoom = NewRoomInfo("301", "Be kind, be friendly, be MCS")

        val resp = client.put(roomPath(room.id)) {
            contentType(ContentType.Application.Json)
            setBody(newRoom)
        }
        assertEquals(HttpStatusCode.OK, resp.status)
        assertEquals(
            KtorTestEnv.database.getRoom(room.id).getOrThrow(),
            newRoom.toCreated(room.id)
        )
    }

    @Test
    fun updateRoomPartially() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthAdmin()
        }
        val room = KtorTestEnv.createRoom("301", "VK -- the meeting point")
        val newRoom = NewRoomInfoWithNull(description =  "Be kind, be friendly, be MCS")

        val resp = client.patch(roomPath(room.id)) {
            contentType(ContentType.Application.Json)
            setBody(newRoom)
        }
        assertEquals(HttpStatusCode.OK, resp.status)
        assertEquals(
            KtorTestEnv.database.getRoom(room.id).getOrThrow(),
            newRoom.toCreated(room)
        )
    }
}
