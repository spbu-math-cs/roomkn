package org.tod87et.roomkn.server.models.reservations

import kotlinx.datetime.Instant

data class UnregisteredReservation(
    val userId: Int,
    val roomId: Int,
    val from: Instant,
    val until: Instant,
)

fun ReservationRequest.toUnregisteredReservation(userId: Int) = UnregisteredReservation(userId, roomId, from, until)
