package org.tod87et.roomkn.server.database

import kotlinx.datetime.Instant
import org.tod87et.roomkn.server.models.users.RegistrationUserInfo
import org.tod87et.roomkn.server.models.users.UserCredentialsInfo
import org.tod87et.roomkn.server.models.users.UserInfo

interface CredentialsDatabase {
    fun registerUser(user: RegistrationUserInfo): Result<UserInfo>

    fun getCredentialsInfoByUsername(username: String): Result<UserCredentialsInfo>

    fun getCredentialsInfoByEmail(email: String): Result<UserCredentialsInfo>

    fun updateUserPassword(userId: Int, passwordHash: ByteArray, salt: ByteArray): Result<Unit>

    /**
     * Invalidates token with specified [hash] and records its original [expirationDate].
     * If token with such [hash] has been already invalidated, overrides its [expirationDate].
     */
    fun invalidateToken(hash: ByteArray, expirationDate: Instant): Result<Unit>

    /**
     * Returns [Result.success] with `true` if token with such [hash] was invalidated and `false` otherwise.
     * May return [Result.failure] with [ConnectionException] if database is not available.
     */
    fun checkTokenWasInvalidated(hash: ByteArray): Result<Boolean>

    /**
     * Removes all expired (with expiration date < current date) tokens from invalidated tokens database.
     */
    fun cleanupExpiredInvalidatedTokens(): Result<Unit>
}
