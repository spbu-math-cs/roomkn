package org.tod87et.roomkn.server.models

/** For internal use only. **Not** serializable */
class RegistrationUserInfo(
    val username: String,
    val email: String,
    val salt: ByteArray,
    val passwordHash: ByteArray,
)
