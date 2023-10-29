package org.tod87et.roomkn.server.auth

import com.auth0.jwt.JWT
import io.ktor.server.auth.Principal
import kotlinx.serialization.Serializable
import kotlinx.serialization.Transient

@Serializable
data class AuthSession(val token: String) : Principal {
    @Transient
    val userId: Int = JWT.decode(token).getClaim(USER_ID_CLAIM_NAME).asInt()
        ?: throw SecurityException("Cannot decode user id from token")

    companion object {
        const val USER_ID_CLAIM_NAME: String = "userId"
    }
}
