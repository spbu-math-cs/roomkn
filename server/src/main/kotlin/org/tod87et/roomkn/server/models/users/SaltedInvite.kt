package org.tod87et.roomkn.server.models.users

import kotlinx.datetime.Instant

data class SaltedInvite(
    val id: Int,
    val remaining: Int,
    val size: Int,
    val until: Instant,
    val salt: ByteArray,
) {
    fun toSaltedInviteRequest(): SaltedInviteRequest {
        return SaltedInviteRequest(size, until, salt)
    }
}