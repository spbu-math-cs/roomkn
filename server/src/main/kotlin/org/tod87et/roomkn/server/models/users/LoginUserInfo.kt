package org.tod87et.roomkn.server.models.users

import kotlinx.serialization.Serializable

@Serializable
data class LoginUserInfo(
    val username: String,
    val password: String,
)
