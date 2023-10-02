package org.tod87et.roomkn.server.database

import kotlinx.datetime.Instant

data class UserEntry(val id: Int, val username: String, val email: String)
data class RoomEntry(val id: Int, val name: String, val description: String)
data class ReservationEntry(val id: Int, val userId: Int, val roomId: Int, val from: Instant, val until: Instant)
