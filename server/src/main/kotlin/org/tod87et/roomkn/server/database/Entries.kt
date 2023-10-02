package org.tod87et.roomkn.server.database

import kotlinx.datetime.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

data class UserEntry(val id: Int, val username: String, val email: String)

data class RoomEntry(val id: Int, val name: String, val description: String)

@Serializable
data class ReservationEntry(
    val id: Int,
    @SerialName("user_id")
    val userId: Int,
    @SerialName("room_id")
    val roomId: Int,
    val from: Instant,
    val until: Instant,
)
