package org.tod87et.roomkn.server.models.reservations

import kotlinx.datetime.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Reservation(
    val id: Int,
    @SerialName("user_id") val userId: Int,
    @SerialName("room_id") val roomId: Int,
    val from: Instant,
    val until: Instant,
    @SerialName("user_name") val userName: String,
    @SerialName("room_name") val roomName: String,
)
