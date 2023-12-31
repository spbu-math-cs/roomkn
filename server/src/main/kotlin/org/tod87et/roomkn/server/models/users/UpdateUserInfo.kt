package org.tod87et.roomkn.server.models.users

import kotlinx.serialization.Serializable

@Serializable
data class UpdateUserInfo(
    val username: String,
    val email: String,
)
