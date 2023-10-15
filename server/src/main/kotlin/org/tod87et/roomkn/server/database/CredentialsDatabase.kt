package org.tod87et.roomkn.server.database

import org.tod87et.roomkn.server.models.RegistrationUserInfo
import org.tod87et.roomkn.server.models.UserCredentialsInfo
import org.tod87et.roomkn.server.models.UserInfo

interface CredentialsDatabase {
    fun registerUser(user: RegistrationUserInfo): Result<UserInfo>

    fun getCredentialsInfoByUsername(username: String): Result<UserCredentialsInfo>

    fun getCredentialsInfoByEmail(email: String): Result<UserCredentialsInfo>
}
