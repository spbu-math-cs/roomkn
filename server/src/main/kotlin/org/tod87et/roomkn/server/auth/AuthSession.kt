package org.tod87et.roomkn.server.auth

import com.auth0.jwt.JWT
import io.ktor.server.auth.Principal
import org.tod87et.roomkn.server.models.permissions.UserPermission

data class AuthSession(val token: String) : Principal {
    companion object {
        const val USER_ID_CLAIM_NAME: String = "userId"
    }
}

val AuthSession.userId: Int get() = JWT.decode(token).getClaim(AuthSession.USER_ID_CLAIM_NAME).asInt()
    ?: throw SecurityException("Cannot decode user id from token")


