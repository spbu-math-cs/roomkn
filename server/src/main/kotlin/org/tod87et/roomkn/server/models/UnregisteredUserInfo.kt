package org.tod87et.roomkn.server.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class UnregisteredUserInfo(
    val username: String,
    val email: String,
    @SerialName("password_hash") val passwordHash: String,
)