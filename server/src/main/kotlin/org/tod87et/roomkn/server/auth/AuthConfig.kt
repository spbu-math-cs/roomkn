package org.tod87et.roomkn.server.auth

import io.ktor.server.config.ApplicationConfig
import org.tod87et.roomkn.server.database.CredentialsDatabase
import org.tod87et.roomkn.server.database.Database
import org.tod87et.roomkn.server.util.checkField
import java.util.Base64
import kotlin.time.Duration
import kotlin.time.Duration.Companion.days
import kotlin.time.Duration.Companion.hours

class AuthConfig(
    val issuer: String,
    val audience: String,
    val secret: ByteArray,
    val pepper: ByteArray,
    val database: Database,
    val credentialsDatabase: CredentialsDatabase,
    val tokenValidityPeriod: Duration,
    val saltSize: Int,
    val hashingAlgorithmId: String,
    val cleanupInterval: Duration,
) {

    class Builder(
        var issuer: String? = null,
        var audience: String? = null,
        var secret: ByteArray? = null,
        var pepper: ByteArray? = null,
        var database: Database? = null,
        var credentialsDatabase: CredentialsDatabase? = null,
        var tokenValidityPeriod: Duration = DEFAULT_TOKEN_VALIDITY_PERIOD,
        var saltSize: Int = DEFAULT_SALT_SIZE,
        var hashingAlgorithmId: String = DEFAULT_HASHING_ALGORITHM_ID,
        val cleanupInterval: Duration = DEFAULT_CLEANUP_INTERVAL,
        ) {
        companion object {
            private val DEFAULT_TOKEN_VALIDITY_PERIOD: Duration = 30.days
            private const val DEFAULT_SALT_SIZE: Int = 32
            private const val DEFAULT_HASHING_ALGORITHM_ID = "SHA-256"
            private val DEFAULT_CLEANUP_INTERVAL = 1.hours
        }

        fun loadFromApplicationConfig(config: ApplicationConfig) = apply {
            val decoder = Base64.getDecoder()

            issuer(config.property("jwt.issuer").getString())
            audience(config.property("jwt.audience").getString())
            pepper(decoder.decode(config.property("auth.pepper").getString()))
            secret(decoder.decode(config.property("jwt.secret").getString()))
        }

        fun issuer(issuer: String) = apply { this.issuer = issuer }

        fun audience(audience: String) = apply { this.audience = audience }

        fun secret(secret: ByteArray) = apply { this.secret = secret }

        fun secret(base64EncodedSecret: String) = apply { this.secret = Base64.getDecoder().decode(base64EncodedSecret) }

        fun database(database: Database) = apply { this.database = database }

        fun credentialsDatabase(credentialsDatabase: CredentialsDatabase) =
            apply { this.credentialsDatabase = credentialsDatabase }

        fun pepper(pepper: ByteArray) = apply { this.pepper = pepper }

        fun pepper(base64EncodedPepper: String) = apply { this.pepper = Base64.getDecoder().decode(base64EncodedPepper) }

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
            checkField(credentialsDatabase, "credentialsDatabase"),
            tokenValidityPeriod,
            saltSize,
            hashingAlgorithmId,
            cleanupInterval
        )
    }
}