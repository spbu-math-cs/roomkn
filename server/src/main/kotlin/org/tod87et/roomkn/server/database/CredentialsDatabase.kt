package org.tod87et.roomkn.server.database

import kotlinx.datetime.Instant
import org.tod87et.roomkn.server.models.users.RegistrationUserInfo
import org.tod87et.roomkn.server.models.users.UserCredentialsInfo
import org.tod87et.roomkn.server.models.users.UserInfo

interface CredentialsDatabase {
    fun registerUser(user: RegistrationUserInfo): Result<UserInfo>

    fun getCredentialsInfoByUsername(username: String): Result<UserCredentialsInfo>

    fun getCredentialsInfoById(userId: Int): Result<UserCredentialsInfo>

    fun getCredentialsInfoByEmail(email: String): Result<UserCredentialsInfo>

    fun updateUserPassword(userId: Int, passwordHash: ByteArray, salt: ByteArray): Result<Unit>

    fun registerToken(hash: ByteArray, expirationDate: Instant): Result<Unit>

    fun invalidateToken(hash: ByteArray): Result<Unit>

    fun checkTokenValid(hash: ByteArray): Result<Boolean>

    fun cleanupExpiredTokens(): Result<Unit>

    fun validateInvite(token: String): Result<Unit>
}
