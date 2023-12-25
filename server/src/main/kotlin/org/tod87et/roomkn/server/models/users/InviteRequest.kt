package org.tod87et.roomkn.server.models.users

import kotlinx.datetime.Instant
import kotlinx.serialization.Serializable

@Serializable
data class InviteRequest(
    val size: Int,
    val until: Instant,
) {
    fun toSalted(salt: ByteArray): SaltedInviteRequest {
        return SaltedInviteRequest(
            size,
            until,
            salt,
        )
    }
}