package org.tod87et.roomkn.server.auth

import org.tod87et.roomkn.server.models.users.LoginUserInfo
import org.tod87et.roomkn.server.models.users.UnregisteredUserInfo

interface AccountController {
    fun authenticateUser(loginUserInfo: LoginUserInfo): Result<AuthSession>

    fun registerUser(userInfo: UnregisteredUserInfo): Result<AuthSession>
}
