package org.tod87et.roomkn.server.models

import kotlinx.serialization.Serializable

@Serializable
data class ShortRoomInfo(
    val id: Int,
    val name: String,
)