package org.tod87et.roomkn.server.models.users

import org.tod87et.roomkn.server.models.permissions.UserPermission

/** For internal use only. **Not** serializable */
class RegistrationUserInfo(
    val username: String,
    val email: String,
    val salt: ByteArray,
    val passwordHash: ByteArray,
    val permissions: List<UserPermission> = listOf()
)
