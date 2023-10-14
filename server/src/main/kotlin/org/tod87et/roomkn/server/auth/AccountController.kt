package org.tod87et.roomkn.server.auth

import org.tod87et.roomkn.server.models.LoginUserInfo
import org.tod87et.roomkn.server.models.UnregisteredUserInfo

interface AccountController {
    fun authenticateUser(loginUserInfo: LoginUserInfo): Result<AuthSession>

    fun registerUser(userInfo: UnregisteredUserInfo): Result<AuthSession>
}
