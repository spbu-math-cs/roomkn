package org.tod87et.roomkn.server.models

import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.junit.jupiter.api.Test
import org.tod87et.roomkn.server.models.permissions.Permission.RoomCreatePermission
import kotlin.test.assertEquals

class SerializationTest {
    @Test
    fun permission() {
        val result = Json.encodeToString(RoomCreatePermission)
        assertEquals("\"${RoomCreatePermission.name}\"", result)
    }
}