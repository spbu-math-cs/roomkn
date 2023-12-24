package org.tod87et.roomkn.server

import io.ktor.client.HttpClient
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.cookies.HttpCookies
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.*
import io.ktor.server.application.Application
import io.ktor.server.config.ApplicationConfig
import io.ktor.server.testing.ApplicationTestBuilder
import io.ktor.server.testing.testApplication
import io.ktor.util.logging.KtorSimpleLogger
import io.ktor.util.logging.Logger
import io.zonky.test.db.postgres.embedded.EmbeddedPostgres
import org.jetbrains.exposed.sql.exposedLogger
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin
import org.tod87et.roomkn.server.auth.AccountController
import org.tod87et.roomkn.server.auth.AccountControllerImpl
import org.tod87et.roomkn.server.auth.AuthConfig
import org.tod87et.roomkn.server.auth.userId
import org.tod87et.roomkn.server.database.CredentialsDatabase
import org.tod87et.roomkn.server.database.Database
import org.tod87et.roomkn.server.database.DatabaseSession
import org.tod87et.roomkn.server.di.ReservationConfig
import org.tod87et.roomkn.server.models.permissions.UserPermission
import org.tod87et.roomkn.server.models.rooms.NewRoomInfo
import org.tod87et.roomkn.server.models.rooms.RoomInfo
import org.tod87et.roomkn.server.models.users.LoginUserInfo
import org.tod87et.roomkn.server.models.users.UnregisteredUserInfo
import org.tod87et.roomkn.server.models.users.UserInfo
import kotlin.concurrent.thread
import kotlin.test.assertEquals


object KtorTestEnv {
    const val API_PATH = "/api/v0"
    const val LOGIN_PATH = "$API_PATH/login"

    private val postgres = EmbeddedPostgres.start()
    private val kTorConfig = ApplicationConfig("test.conf")

    private val databaseSession = DatabaseSession(postgres.postgresDatabase)

    private val authConfig = AuthConfig.Builder()
        .database(databaseSession)
        .credentialsDatabase(databaseSession)
        .loadFromApplicationConfig(kTorConfig)
        .build()

    private val reservationConfig = ReservationConfig()

    init {
        Runtime.getRuntime().addShutdownHook(
            thread(start = false) {
                postgres.close()
            }
        )
    }

    val database: Database get() = databaseSession

    val credentialsDatabase: CredentialsDatabase get() = databaseSession

    val accountController = AccountControllerImpl(
        exposedLogger,
        authConfig
    )

    fun testJsonApplication(body: suspend ApplicationTestBuilder.(HttpClient) -> Unit) = try {
        testApplication {
            environment {
                config = kTorConfig
            }
            val client = createClient {
                install(ContentNegotiation) {
                    json()
                }
                install(HttpCookies)
            }

            body(client)
        }
    } finally {
        resetDatabase()
    }

    suspend fun HttpClient.createAndAuthAdmin(
        name: String = "Root",
        password: String = "the-root-of-evil",
        email: String = "$name@example.org"
    ): Int {
        return createAndAuthUser(
            name,
            password,
            email,
            UserPermission.entries.toList(),
        )
    }

    fun createUser(name: String, password: String = "qwerty", email: String = "$name@example.org"): Int {
        val initialSession = accountController.registerUser(UnregisteredUserInfo(name, email, password))
            .getOrThrow()

        database.updateUserPermissions(
            initialSession.userId,
            listOf(UserPermission.ReservationsCreate)
        ).getOrThrow()

        return initialSession.userId
    }

    suspend fun HttpClient.createAndAuthUser(
        name: String = "Alice",
        password: String = "qwerty",
        email: String = "$name@example.org",
        permissions: List<UserPermission> = listOf(UserPermission.ReservationsCreate)
    ): Int {
        val initialSession = accountController.registerUser(UnregisteredUserInfo(name, email, password))
            .getOrThrow()
        database.updateUserPermissions(
            initialSession.userId,
            permissions
        ).getOrThrow()

        val auth = post(LOGIN_PATH) {
            contentType(ContentType.Application.Json)
            setBody(LoginUserInfo(name, password))
        }
        assertEquals(HttpStatusCode.OK, auth.status)

        return initialSession.userId
    }

    suspend fun HttpClient.createAndAuthUserWithInfo(
        name: String = "Alice",
        password: String = "qwerty",
        email: String = "$name@example.org",
        permissions: List<UserPermission> = listOf(UserPermission.ReservationsCreate)
    ): UserInfo {
        val id = createAndAuthUser(name, password, email, permissions)
        return database.getUser(id).getOrThrow()
    }

    fun createRoom(name: String, desc: String = "Description of $name"): RoomInfo {
        return database.createRoom(NewRoomInfo(name, desc)).getOrThrow()
    }

    fun resetDatabase() {
        databaseSession.clear()
    }

    @Suppress("unused") // Used in test.conf
    fun Application.koinPlugin() {
        install(Koin) {
            modules(testKoinModule)
        }
    }

    private val testKoinModule = module {
        single<Logger> {
            KtorSimpleLogger("TestLogger")
        }
        single<Database> {
            database
        }
        single<CredentialsDatabase> {
            credentialsDatabase
        }
        single<AuthConfig> {
            authConfig
        }
        single<AccountController> {
            accountController
        }
        single<ReservationConfig> {
            reservationConfig
        }
    }
}
