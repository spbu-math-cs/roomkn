package org.tod87et.roomkn.server.auth

import com.auth0.jwt.interfaces.JWTVerifier
import org.tod87et.roomkn.server.models.users.LoginUserInfo
import org.tod87et.roomkn.server.models.users.UnregisteredUserInfo

interface AccountController {

    val jwtVerifier: JWTVerifier

    fun authenticateUser(loginUserInfo: LoginUserInfo): Result<AuthSession>

    fun registerUser(userInfo: UnregisteredUserInfo): Result<AuthSession>

    fun validateSession(session: AuthSession): Result<Boolean>

    fun invalidateSession(session: AuthSession): Result<Unit>

    fun startCleanupThread()

    fun stopCleanupThread()
}
