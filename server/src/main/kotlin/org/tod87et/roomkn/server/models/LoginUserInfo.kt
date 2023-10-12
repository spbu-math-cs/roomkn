package org.tod87et.roomkn.server.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class LoginUserInfo(
    val username: String,
    @SerialName("password") val password: String,
)
