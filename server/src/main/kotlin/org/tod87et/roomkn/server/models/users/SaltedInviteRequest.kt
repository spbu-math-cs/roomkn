package org.tod87et.roomkn.server.models.users

import kotlinx.datetime.Instant

data class SaltedInviteRequest(
    val size: Int,
    val until: Instant,
    val salt: ByteArray,
)