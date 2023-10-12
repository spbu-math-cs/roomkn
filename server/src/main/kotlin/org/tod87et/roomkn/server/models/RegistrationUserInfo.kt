package org.tod87et.roomkn.server.models

class RegistrationUserInfo(
    val username: String,
    val email: String,
    val salt: ByteArray,
    val passwordHash: ByteArray,
)
