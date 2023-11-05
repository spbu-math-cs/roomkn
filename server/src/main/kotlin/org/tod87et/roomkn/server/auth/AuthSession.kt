package org.tod87et.roomkn.server.auth

import com.auth0.jwt.JWT
import io.ktor.server.auth.Principal
import org.tod87et.roomkn.server.models.permissions.UserPermission

data class AuthSession(val token: String) : Principal {
    companion object {
        const val USER_ID_CLAIM_NAME: String = "userId"
        const val USER_PERMISSIONS_CLAIM_NAME: String = "permissions"
    }
}

val AuthSession.userId: Int
    get() = JWT.decode(token).getClaim(AuthSession.USER_ID_CLAIM_NAME).asInt()
        ?: throw SecurityException("Cannot decode user id from token")

val AuthSession.permissions: List<UserPermission>
    get() = JWT.decode(token)
        .getClaim(AuthSession.USER_PERMISSIONS_CLAIM_NAME)
        .asList(String::class.java)
        ?.mapNotNull {
            runCatching { UserPermission.valueOf(it) }.getOrNull()
        } ?: emptyList()

