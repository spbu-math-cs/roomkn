package org.tod87et.roomkn.server.models.users

import kotlinx.serialization.Serializable

@Serializable
data class UpdateUserInfoWithNull(
    val username: String? = null,
    val email: String? = null,
)