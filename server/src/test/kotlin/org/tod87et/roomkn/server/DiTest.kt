package org.tod87et.roomkn.server

import io.ktor.events.Events
import io.ktor.server.application.ApplicationEnvironment
import io.ktor.server.config.ApplicationConfig
import io.ktor.util.logging.KtorSimpleLogger
import io.ktor.util.logging.Logger
import kotlin.coroutines.CoroutineContext
import kotlin.test.Test
import kotlin.test.assertNotNull
import kotlin.test.fail
import kotlinx.datetime.Instant
import org.junit.jupiter.api.assertAll
import org.koin.dsl.koinApplication
import org.koin.dsl.module
import org.koin.test.KoinTest
import org.tod87et.roomkn.server.auth.AccountController
import org.tod87et.roomkn.server.auth.AuthConfig
import org.tod87et.roomkn.server.auth.di.authModule
import org.tod87et.roomkn.server.database.CredentialsDatabase
import org.tod87et.roomkn.server.database.Database
import org.tod87et.roomkn.server.di.Di
import org.tod87et.roomkn.server.di.applicationModule
import org.tod87et.roomkn.server.models.permissions.UserPermission
import org.tod87et.roomkn.server.models.reservations.Reservation
import org.tod87et.roomkn.server.models.reservations.UnregisteredReservation
import org.tod87et.roomkn.server.models.rooms.NewRoomInfo
import org.tod87et.roomkn.server.models.rooms.NewRoomInfoWithNull
import org.tod87et.roomkn.server.models.rooms.RoomInfo
import org.tod87et.roomkn.server.models.rooms.ShortRoomInfo
import org.tod87et.roomkn.server.models.users.FullUserInfo
import org.tod87et.roomkn.server.models.users.InviteRequest
import org.tod87et.roomkn.server.models.users.RegistrationUserInfo
import org.tod87et.roomkn.server.models.users.ShortUserInfo
import org.tod87et.roomkn.server.models.users.UpdateUserInfo
import org.tod87et.roomkn.server.models.users.UpdateUserInfoWithNull
import org.tod87et.roomkn.server.models.users.UserCredentialsInfo
import org.tod87et.roomkn.server.models.users.UserInfo

class DiTest : KoinTest {
    @Test
    fun allComponentsPresent() {
        val app = koinApplication {
            modules(
                Di.authModule,
                module {
                    single<Database> {
                        DatabaseMock()
                    }
                    single<CredentialsDatabase> {
                        CredentialsDatabaseMock()
                    }
                },
                Di.applicationModule(
                    object : ApplicationEnvironment {
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

private class CredentialsDatabaseMock : CredentialsDatabase {
    override fun registerUser(user: RegistrationUserInfo): Result<UserInfo> = fail()

    override fun getCredentialsInfoByUsername(username: String): Result<UserCredentialsInfo> =
        fail()

    override fun getCredentialsInfoById(userId: Int): Result<UserCredentialsInfo> = fail()

    override fun getCredentialsInfoByEmail(email: String): Result<UserCredentialsInfo> = fail()

    override fun updateUserPassword(
        userId: Int,
        passwordHash: ByteArray,
        salt: ByteArray
    ): Result<Unit> = fail()

    override fun registerToken(hash: ByteArray, expirationDate: Instant): Result<Unit> = fail()

    override fun invalidateToken(hash: ByteArray): Result<Unit> = fail()

    override fun checkTokenValid(hash: ByteArray): Result<Boolean> = fail()

    override fun cleanupExpiredTokens(): Result<Unit> = fail()
    override fun validateInvite(token: String): Result<Unit> = fail()
}

private class DatabaseMock : Database {
    override fun getRooms(limit: Int, offset: Long): Result<List<ShortRoomInfo>> = fail()

    override fun getRoom(roomId: Int): Result<RoomInfo> = fail()

    override fun createRoom(roomInfo: NewRoomInfo): Result<RoomInfo> = fail()

    override fun updateRoom(roomId: Int, roomInfo: NewRoomInfo): Result<Unit> = fail()

    override fun updateRoomPartially(roomId: Int, roomInfo: NewRoomInfoWithNull): Result<Unit> = fail()

    override fun deleteRoom(roomId: Int): Result<Unit> = fail()
    override fun getMap(): Result<String> = fail()

    override fun updateMap(newMap: String): Result<Unit> = fail()
    override fun createDefaultMap(): Result<Unit> = fail()

    override fun getRoomReservations(
        roomId: Int,
        from: Instant?,
        until: Instant?,
        limit: Int,
        offset: Long
    ): Result<List<Reservation>> = fail()

    override fun getUserReservations(
        userId: Int,
        from: Instant?,
        until: Instant?,
        limit: Int,
        offset: Long
    ): Result<List<Reservation>> = fail()

    override fun getReservations(
        usersIds: List<Int>,
        roomsIds: List<Int>,
        from: Instant?,
        until: Instant?,
        limit: Int,
        offset: Long
    ): Result<List<Reservation>> = fail()

    override fun getReservation(reservationId: Int): Result<Reservation> = fail()

    override fun updateReservation(
        reservationId: Int,
        from: Instant,
        until: Instant
    ): Result<Unit> = fail()

    override fun deleteReservation(reservationId: Int): Result<Unit> = fail()

    override fun createReservation(reservation: UnregisteredReservation): Result<Reservation> =
        fail()

    override fun getUsers(limit: Int, offset: Long): Result<List<ShortUserInfo>> = fail()

    override fun getFullUsers(limit: Int, offset: Long): Result<List<FullUserInfo>> = fail()

    override fun getUser(userId: Int): Result<UserInfo> = fail()

    override fun updateUserInfo(userId: Int, info: UpdateUserInfo): Result<Unit> = fail()

    override fun updateUserInfoPartially(userId: Int, info: UpdateUserInfoWithNull): Result<Unit> = fail()

    override fun deleteUser(userId: Int): Result<Unit> = fail()

    override fun getUserPermissions(userId: Int): Result<List<UserPermission>> = fail()

    override fun updateUserPermissions(
        userId: Int,
        permissions: List<UserPermission>
    ): Result<Unit> = fail()

    override fun createInvite(inviteRequest: InviteRequest): Result<Unit> = fail()

    override fun clear(): Result<Unit> = fail()
}
