package org.tod87et.roomkn.server.models.reservations

import kotlinx.serialization.Serializable

@Serializable
data class MultipleReservationResult(val success: List<Reservation>, val failure: List<FailedReservation>)
