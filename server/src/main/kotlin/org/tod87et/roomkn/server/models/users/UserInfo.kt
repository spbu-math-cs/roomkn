package org.tod87et.roomkn.server.models.users

import kotlinx.serialization.Serializable

@Serializable
data class UserInfo(
    val id: Int,
    val username: String,
    val email: String,
)