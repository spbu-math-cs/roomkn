package org.tod87et.roomkn.server.models.reservations

import kotlinx.datetime.Instant
import kotlinx.serialization.Serializable

@Serializable
data class NewReservationBounds(
    val from: Instant,
    val until: Instant,
)
