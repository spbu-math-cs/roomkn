package org.tod87et.roomkn.server.models.users

import kotlinx.serialization.Serializable

@Serializable
data class PasswordUpdateInfo(
    val oldPassword: String,
    val newPassword: String,
)
