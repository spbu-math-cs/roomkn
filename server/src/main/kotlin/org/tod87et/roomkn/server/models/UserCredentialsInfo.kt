package org.tod87et.roomkn.server.models

/** For internal use only. **Not** serializable */
class UserCredentialsInfo(
    val id: Int,
    val salt: ByteArray,
    val passwordHash: ByteArray,
)
