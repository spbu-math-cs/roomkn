package org.tod87et.roomkn.server.models

import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.junit.jupiter.api.Test
import org.tod87et.roomkn.server.models.permissions.UserPermission
import kotlin.test.assertEquals

class SerializationTest {
    @Test
    fun permission() {
        val result = Json.encodeToString(UserPermission.RoomsAdmin)
        assertEquals("\"${UserPermission.RoomsAdmin.name}\"", result)
    }
}
