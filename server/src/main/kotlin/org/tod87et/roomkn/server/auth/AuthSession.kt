package org.tod87et.roomkn.server.auth

import io.ktor.server.auth.Principal

data class AuthSession(val userId: Int, val token: String) : Principal {
    companion object {
        const val USER_ID_CLAIM_NAME: String = "userId"
    }
}
