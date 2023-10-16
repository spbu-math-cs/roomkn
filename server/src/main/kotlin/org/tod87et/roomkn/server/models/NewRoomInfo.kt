package org.tod87et.roomkn.server.models

import kotlinx.serialization.Serializable

@Serializable
data class NewRoomInfo(
    val name: String,
    val description: String,
)