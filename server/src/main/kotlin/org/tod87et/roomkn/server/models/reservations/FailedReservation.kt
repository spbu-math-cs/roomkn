package org.tod87et.roomkn.server.models.reservations

import kotlinx.serialization.Serializable

@Serializable
data class FailedReservation(
    val request: ReservationRequest,
    val message: String
)
