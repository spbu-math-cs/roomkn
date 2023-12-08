package org.tod87et.roomkn.server.models.rooms

import kotlinx.serialization.Serializable

@Serializable
data class NewRoomInfoWithNull(
    val name: String? = null,
    val description: String? = null,
)