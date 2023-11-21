package org.tod87et.roomkn.server

import io.ktor.events.Events
import io.ktor.server.application.ApplicationEnvironment
import io.ktor.server.config.ApplicationConfig
import io.ktor.util.logging.KtorSimpleLogger
import io.ktor.util.logging.Logger
import org.junit.jupiter.api.assertAll
import org.koin.dsl.koinApplication
import org.koin.test.KoinTest
import org.tod87et.roomkn.server.auth.AccountController
import org.tod87et.roomkn.server.auth.AuthConfig
import org.tod87et.roomkn.server.auth.di.authModule
import org.tod87et.roomkn.server.database.CredentialsDatabase
import org.tod87et.roomkn.server.database.Database
import org.tod87et.roomkn.server.database.di.databaseModule
import org.tod87et.roomkn.server.di.Di
import org.tod87et.roomkn.server.di.applicationModule
import kotlin.coroutines.CoroutineContext
import kotlin.test.Test
import kotlin.test.assertNotNull
import kotlin.test.fail

class DiTest : KoinTest {
    @Test
    fun allComponentsPresent() {
        val app = koinApplication {
            modules(
                Di.authModule,
                Di.databaseModule,
                Di.applicationModule(object : ApplicationEnvironment {
                    override val classLoader: ClassLoader get() = fail()

                    override val config: ApplicationConfig = ApplicationConfig("test.conf")

                    override val developmentMode: Boolean = true

                    override val log: Logger = KtorSimpleLogger("TestLogger")

                    override val monitor: Events get() = fail()

                    override val parentCoroutineContext: CoroutineContext get() = fail()

                    override val rootPath: String get() = fail()
                }
                )
            )
        }

        assertAll(
            { assertNotNull(app.koin.get<AuthConfig>()) },
            { assertNotNull(app.koin.get<AccountController>()) },
            { assertNotNull(app.koin.get<Database>()) },
            { assertNotNull(app.koin.get<CredentialsDatabase>()) },
        )
    }
}