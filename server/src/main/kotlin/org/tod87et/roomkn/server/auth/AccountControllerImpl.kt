package org.tod87et.roomkn.server.auth

import com.auth0.jwt.JWT
import com.auth0.jwt.JWTVerifier
import com.auth0.jwt.algorithms.Algorithm
import io.ktor.util.logging.Logger
import kotlinx.datetime.toKotlinInstant
import org.tod87et.roomkn.server.database.ConstraintViolationException
import org.tod87et.roomkn.server.database.MissingElementException
import org.tod87et.roomkn.server.models.users.LoginUserInfo
import org.tod87et.roomkn.server.models.users.RegistrationUserInfo
import org.tod87et.roomkn.server.models.users.UnregisteredUserInfo
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.Date
import java.util.concurrent.atomic.AtomicReference
import kotlin.concurrent.thread

class AccountControllerImpl(
    private val log: Logger,
    private val config: AuthConfig,
) : AccountController {
    private val digestThreadLocal = ThreadLocal.withInitial {
        MessageDigest.getInstance(config.hashingAlgorithmId)
    }
    private val digest: MessageDigest get() = digestThreadLocal.get()

    private val secureRandomThreadLocal = ThreadLocal.withInitial {
        SecureRandom.getInstanceStrong()
    }
    private val secureRandom get() = secureRandomThreadLocal.get()

    private val signAlgorithm = Algorithm.HMAC256(config.secret)

    private val cleanupThread: AtomicReference<Thread?> = AtomicReference(null)

    override val jwtVerifier: JWTVerifier = JWT
        .require(Algorithm.HMAC256(config.secret))
        .withAudience(config.audience)
        .withIssuer(config.issuer)
        .build()

    override fun authenticateUser(loginUserInfo: LoginUserInfo): Result<AuthSession> {
        val credentials = config.database.getCredentialsInfoByUsername(loginUserInfo.username)
            .getOrElse { ex ->
                return when (ex) {
                    is MissingElementException -> {
                        Result.failure(NoSuchUserException(loginUserInfo.username, ex))
                    }

                    else -> {
                        Result.failure(ex)
                    }
                }
            }

        digest.update(config.pepper)
        digest.update(credentials.salt)
        digest.update(loginUserInfo.password.encodeToByteArray())

        val passwordHash = digest.digest()
        return if (passwordHash.contentEquals(credentials.passwordHash)) {
            log.debug("Authentication successful for `${loginUserInfo.username}`")
            Result.success(AuthSession(createToken(credentials.id)))
        } else {
            log.debug("Authentication failed for `${loginUserInfo.username}`")
            Result.failure(AuthFailedException("Wrong username or password"))
        }
    }

    override fun registerUser(userInfo: UnregisteredUserInfo): Result<AuthSession> {
        val salt = ByteArray(config.saltSize).apply(secureRandom::nextBytes)

        digest.update(config.pepper)
        digest.update(salt)
        digest.update(userInfo.password.encodeToByteArray())

        val registrationInfo = RegistrationUserInfo(
            username = userInfo.username,
            email = userInfo.email,
            salt = salt,
            passwordHash = digest.digest()
        )
        val res = config.database.registerUser(registrationInfo)

        val info = res.getOrElse { ex ->
            log.debug("Failed to register user `${userInfo.username}`", ex)

            return when (ex) {
                is ConstraintViolationException -> {
                    if (
                        ex.constraint == ConstraintViolationException.Constraint.USERNAME ||
                        ex.constraint == ConstraintViolationException.Constraint.EMAIL
                    ) {
                        Result.failure(RegistrationFailedException("User with such username already exists"))
                    } else {
                        Result.failure(ex)
                    }
                }

                else -> {
                    Result.failure(ex)
                }
            }
        }

        log.debug("User `${info.username}` has been registered")
        return Result.success(AuthSession(createToken(info.id)))
    }

    override fun validateSession(session: AuthSession): Result<Boolean> {
        runCatching { jwtVerifier.verify(session.token) }
            .getOrElse {
                log.debug("Token verification failed", it)
                return Result.success(false)
            }
        digest.update(session.token.encodeToByteArray())
        return config.database.checkTokenWasInvalidated(digest.digest()).map { !it }
    }

    override fun invalidateSession(session: AuthSession): Result<Unit> {
        digest.update(session.token.encodeToByteArray())
        return config.database.invalidateToken(
            digest.digest(),
            JWT.decode(session.token).expiresAtAsInstant.toKotlinInstant()
        )
    }

    override fun startCleanupThread() {
        val newThread = createCleanupThread()
        cleanupThread.getAndSet(null)?.run {
            interrupt()
            join()
        }
        newThread.start()
    }

    override fun stopCleanupThread() {
        cleanupThread.getAndSet(null)?.run {
            interrupt()
            join()
        }
    }

    private fun createCleanupThread(): Thread = thread(start = false) {
        while (!Thread.interrupted()) {
            try {
                Thread.sleep(config.cleanupInterval.inWholeMilliseconds)
                config.database.cleanupExpiredInvalidatedTokens().getOrThrow()
            } catch (_: InterruptedException) {
                break
            } catch (e: Exception) {
                log.error("Invalid tokens cleanup failed", e)
            }
        }
    }

    private fun createToken(userId: Int): String {
        return JWT.create()
            .withAudience(config.audience)
            .withIssuer(config.issuer)
            .withClaim(AuthSession.USER_ID_CLAIM_NAME, userId)
            .withExpiresAt(Date(System.currentTimeMillis() + config.tokenValidityPeriod.inWholeMilliseconds))
            .sign(signAlgorithm)
    }
}
