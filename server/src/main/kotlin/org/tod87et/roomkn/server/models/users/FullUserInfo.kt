package org.tod87et.roomkn.server.models.users

import kotlinx.serialization.Serializable
import org.tod87et.roomkn.server.models.permissions.UserPermission

@Serializable
data class FullUserInfo(
    val id: Int,
    val username: String,
    val email: String,
    val permissions: Set<UserPermission>
)
