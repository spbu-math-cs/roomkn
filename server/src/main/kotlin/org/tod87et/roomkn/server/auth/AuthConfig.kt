package org.tod87et.roomkn.server.auth

import io.ktor.server.application.ApplicationEnvironment
import org.tod87et.roomkn.server.database.CredentialsDatabase
import org.tod87et.roomkn.server.util.checkField
import java.util.Base64
import kotlin.time.Duration
import kotlin.time.Duration.Companion.days

class AuthConfig(
    val issuer: String,
    val audience: String,
    val secret: ByteArray,
    val pepper: ByteArray,
    val database: CredentialsDatabase,
    val tokenValidityPeriod: Duration,
    val saltSize: Int,
    val hashingAlgorithmId: String,
) {

    class Builder(
        var issuer: String? = null,
        var audience: String? = null,
        var secret: ByteArray? = null,
        var pepper: ByteArray? = null,
        var database: CredentialsDatabase? = null,
        var tokenValidityPeriod: Duration = DEFAULT_TOKEN_VALIDITY_PERIOD,
        var saltSize: Int = DEFAULT_SALT_SIZE,
        var hashingAlgorithmId: String = DEFAULT_HASHING_ALGORITHM_ID,
    ) {
        companion object {
            private val DEFAULT_TOKEN_VALIDITY_PERIOD: Duration = 30.days
            private const val DEFAULT_SALT_SIZE: Int = 32
            private const val DEFAULT_HASHING_ALGORITHM_ID = "SHA-256"
        }

        fun loadEnvironment(env: ApplicationEnvironment) = apply {
            val decoder = Base64.getDecoder()

            issuer = env.config.property("jwt.issuer").getString()
            audience = env.config.property("jwt.audience").getString()
            pepper = decoder.decode(env.config.property("auth.pepper").getString())
            secret = decoder.decode(env.config.property("jwt.secret").getString())
        }

        fun issuer(issuer: String) = apply { this.issuer = issuer }

        fun audience(audience: String) = apply { this.audience = audience }

        fun secret(secret: ByteArray) = apply { this.secret = secret }

        fun secret(secret: String) = apply { this.secret = Base64.getDecoder().decode(secret) }

        fun database(database: CredentialsDatabase) = apply { this.database = database }

        fun pepper(pepper: ByteArray) = apply { this.pepper = pepper }

        fun pepper(pepper: String) = apply { this.pepper = Base64.getDecoder().decode(pepper) }

        fun tokenValidityPeriod(tokenValidityPeriod: Duration) =
            apply { this.tokenValidityPeriod = tokenValidityPeriod }

        fun saltSize(saltSize: Int) =
            apply { this.saltSize = saltSize }

        fun hashingAlgorithmId(hashingAlgorithmId: String) =
            apply { this.hashingAlgorithmId = hashingAlgorithmId }

        fun build(): AuthConfig = AuthConfig(
            checkField(issuer, "issuer"),
            checkField(audience, "audience"),
            checkField(secret, "secret"),
            checkField(pepper, "pepper"),
            checkField(database, "database"),
            tokenValidityPeriod,
            saltSize,
            hashingAlgorithmId
        )
    }
}