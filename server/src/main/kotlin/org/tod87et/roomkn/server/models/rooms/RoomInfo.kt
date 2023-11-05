package org.tod87et.roomkn.server.models.rooms

import kotlinx.serialization.Serializable

@Serializable
data class RoomInfo(
    val id: Int,
    val name: String,
    val description: String,
)
