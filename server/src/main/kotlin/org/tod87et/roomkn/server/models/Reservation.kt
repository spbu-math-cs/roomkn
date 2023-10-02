package org.tod87et.roomkn.server.models

import kotlinx.datetime.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Reservation(
    @SerialName("user_id")
    val userId: Int,
    val from: Instant,
    val until: Instant,
    @SerialName("room_id")
    val roomId: Int,
)
