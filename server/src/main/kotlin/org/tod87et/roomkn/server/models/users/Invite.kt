package org.tod87et.roomkn.server.models.users

import kotlinx.datetime.Instant
import kotlinx.serialization.Serializable

@Serializable
data class Invite(
    val id: Int,
    val remaining: Int,
    val size: Int,
    val until: Instant,
)