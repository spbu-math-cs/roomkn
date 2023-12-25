package org.tod87et.roomkn.server.models.users

import kotlinx.datetime.Instant
import kotlinx.serialization.Serializable

@Serializable
data class InviteRequest(
    val size: Int,
    val until: Instant,
)