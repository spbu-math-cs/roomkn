package org.tod87et.roomkn.server

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres
import kotlinx.datetime.Clock
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.AfterEach
import org.tod87et.roomkn.server.database.ConstraintViolationException
import org.tod87et.roomkn.server.database.DatabaseSession
import org.tod87et.roomkn.server.database.MissingElementException
import org.tod87et.roomkn.server.database.ReservationException
import org.tod87et.roomkn.server.models.permissions.UserPermission
import org.tod87et.roomkn.server.models.rooms.NewRoomInfo
import org.tod87et.roomkn.server.models.users.RegistrationUserInfo
import org.tod87et.roomkn.server.models.reservations.Reservation
import org.tod87et.roomkn.server.models.rooms.RoomInfo
import org.tod87et.roomkn.server.models.rooms.ShortRoomInfo
import org.tod87et.roomkn.server.models.users.ShortUserInfo
import org.tod87et.roomkn.server.models.reservations.UnregisteredReservation
import org.tod87et.roomkn.server.models.users.UserInfo
import javax.sql.DataSource
import kotlin.test.assertContentEquals
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import kotlin.test.assertFalse
import kotlin.test.assertIs
import kotlin.time.Duration.Companion.hours
import kotlin.time.Duration.Companion.minutes
import kotlin.time.Duration.Companion.seconds

class DatabaseTest {
    @AfterEach
    fun clear() {
        database.clear()
    }

    @Test
    fun roomsApiTest() {
        val room1 = NewRoomInfo("room1", "desc1")
        val room2 = NewRoomInfo("room2", "desc2")

        val room1Info = database.createRoom(room1).getOrThrow()
        val room2Info = database.createRoom(room2).getOrThrow()

        assertEquals(RoomInfo(room1Info.id, room1.name, room1.description), room1Info)
        assertEquals(RoomInfo(room2Info.id, room2.name, room2.description), room2Info)

        assertEquals(room1Info, database.getRoom(room1Info.id).getOrThrow())
        assertEquals(room2Info, database.getRoom(room2Info.id).getOrThrow())

        val expectedRooms = listOf(room1Info, room2Info).map { ShortRoomInfo(it.id, it.name) }.sortedBy { it.id }
        val rooms = database.getRooms().getOrThrow().sortedBy { it.id }

        assertEquals(expectedRooms, rooms)

        val incorrectId = rooms.last().id + 1
        assertIs<MissingElementException>(database.getRoom(incorrectId).exceptionOrNull())

        val updatedRoomInfo = NewRoomInfo("newRoom", "newDescription")

        assertTrue(database.updateRoom(room1Info.id, updatedRoomInfo).isSuccess)
        assertEquals(
            RoomInfo(room1Info.id, updatedRoomInfo.name, updatedRoomInfo.description),
            database.getRoom(room1Info.id).getOrThrow()
        )

        assertTrue(database.deleteRoom(room2Info.id).isSuccess)
        assertIs<MissingElementException>(database.getRoom(room2Info.id).exceptionOrNull())
    }

    @Test
    fun usersApiTest() {
        val user2Permissions = listOf(UserPermission.UsersAdmin, UserPermission.ReservationsCreate)
        val user1 = RegistrationUserInfo("user1", "email1", byteArrayOf(1), byteArrayOf(2))
        val user2 = RegistrationUserInfo(
            "user2",
            "email2",
            byteArrayOf(3),
            byteArrayOf(4),
            user2Permissions
        )

        val user1Info = database.registerUser(user1).getOrThrow()
        val user2Info = database.registerUser(user2).getOrThrow()

        assertEquals(UserInfo(user1Info.id, user1.username, user1.email), user1Info)
        assertEquals(UserInfo(user2Info.id, user2.username, user2.email), user2Info)

        assertEquals(user1Info, database.getUser(user1Info.id).getOrThrow())
        assertEquals(user2Info, database.getUser(user2Info.id).getOrThrow())

        val expectedUsers = listOf(user1Info, user2Info).map { ShortUserInfo(it.id, it.username) }.sortedBy { it.id }
        val users = database.getUsers().getOrThrow().sortedBy { it.id }

        assertEquals(expectedUsers, users)

        val incorrectId = users.last().id + 1
        assertIs<MissingElementException>(database.getUser(incorrectId).exceptionOrNull())

        val incorrectUser = RegistrationUserInfo(user1.username, "email3", byteArrayOf(5), byteArrayOf(6))
        assertIs<ConstraintViolationException>(database.registerUser(incorrectUser).exceptionOrNull())

        assertEquals(user2Permissions.sorted(), database.getUserPermissions(user2Info.id).getOrThrow().sorted())

        val newPermissions = listOf(UserPermission.RoomsAdmin)
        assertTrue(database.updateUserPermissions(user2Info.id, newPermissions).isSuccess)
        assertEquals(newPermissions.sorted(), database.getUserPermissions(user2Info.id).getOrThrow().sorted())

        val userToDelete = expectedUsers.last().id
        assertTrue(database.deleteUser(userToDelete).isSuccess)
        assertEquals(expectedUsers.dropLast(1), database.getUsers().getOrThrow().sortedBy { it.id })

        val userToUpdate = expectedUsers.first().id
        val newUsername = "newUsername"
        val newEmail = "newEmail"
        assertTrue(database.updateUserInfo(userToUpdate, newUsername, newEmail).isSuccess)
        assertEquals(UserInfo(userToUpdate, newUsername, newEmail), database.getUser(userToUpdate).getOrThrow())
    }

    @Test
    fun credentialsApiTest() {
        val user = RegistrationUserInfo("user", "email", byteArrayOf(1), byteArrayOf(2))
        database.registerUser(user).getOrThrow()

        val credentialsByEmail = database.getCredentialsInfoByEmail(user.email).getOrThrow()
        val credentialsByUsername = database.getCredentialsInfoByUsername(user.username).getOrThrow()
        val userId = credentialsByEmail.id

        assertContentEquals(user.passwordHash, credentialsByEmail.passwordHash)
        assertContentEquals(user.salt, credentialsByEmail.salt)
        assertContentEquals(user.passwordHash, credentialsByUsername.passwordHash)
        assertContentEquals(user.salt, credentialsByUsername.salt)

        val newPassword = byteArrayOf(2)
        val newSalt = byteArrayOf(2)

        assertTrue(database.updateUserPassword(userId, newPassword, newSalt).isSuccess)

        val credentialsInfo = database.getCredentialsInfoByEmail(user.email).getOrThrow()

        assertContentEquals(newPassword, credentialsInfo.passwordHash)
        assertContentEquals(newSalt, credentialsInfo.salt)
    }

    @Test
    fun reservationsApiTest() {
        val room1 = NewRoomInfo("room1", "description")
        val room2 = NewRoomInfo("room2", "description")
        val user = RegistrationUserInfo("user", "email", byteArrayOf(1), byteArrayOf(2))
        val room1Info = database.createRoom(room1).getOrThrow()
        val room2Info = database.createRoom(room2).getOrThrow()
        val userInfo = database.registerUser(user).getOrThrow()

        val from = Clock.System.now()
        val until = from + 4.minutes

        val invalidReservation = UnregisteredReservation(userInfo.id + 1, room1Info.id, from, until)

        assertIs<ConstraintViolationException>(database.createReservation(invalidReservation).exceptionOrNull())

        val reservation1 = UnregisteredReservation(userInfo.id, room1Info.id, from, until)
        val reservation2 = UnregisteredReservation(userInfo.id, room2Info.id, from, until)
        val reservation2Info = database.createReservation(reservation2).getOrThrow()

        assertTrue(database.createReservation(reservation1).isSuccess)

        assertIs<ReservationException>(database.createReservation(reservation1).exceptionOrNull())

        val room1Reservations = database.getRoomReservations(room1Info.id).getOrThrow()
        val expectedReservation = Reservation(
            room1Reservations.first().id,
            userInfo.id,
            room1Info.id,
            from,
            until
        )

        assertEquals(listOf(expectedReservation), room1Reservations)

        val newFrom = until + 1.seconds
        val newUntil = until + 3.seconds
        val reservation3 = UnregisteredReservation(userInfo.id, room2Info.id, newFrom, newUntil)
        val reservation3Info = database.createReservation(reservation3).getOrThrow()

        assertIs<ReservationException>(database.updateReservation(reservation2Info.id, newFrom, newUntil).exceptionOrNull())
        assertTrue(database.deleteReservation(reservation3Info.id).isSuccess)
        assertTrue(database.updateReservation(reservation2Info.id, newFrom, newUntil).isSuccess)
    }

    @Test
    fun invalidatedTokensApiTest() {
        val tokenHash = byteArrayOf(1)
        val now = Clock.System.now()

        database.invalidateToken(tokenHash, now)
        assertTrue(database.checkTokenWasInvalidated(tokenHash).getOrThrow())

        database.cleanupExpiredInvalidatedTokens()
        assertFalse(database.checkTokenWasInvalidated(tokenHash).getOrThrow())

        database.invalidateToken(tokenHash, now)
        database.invalidateToken(tokenHash, now + 1.hours)
        database.cleanupExpiredInvalidatedTokens()
        assertTrue(database.checkTokenWasInvalidated(tokenHash).getOrThrow())
    }

    companion object {
        private val embeddedPostgres: EmbeddedPostgres = EmbeddedPostgres.start()
        private val dataSource: DataSource = embeddedPostgres.postgresDatabase

        val database: DatabaseSession = DatabaseSession(dataSource)

        @JvmStatic
        @AfterAll
        fun shutdown() {
            embeddedPostgres.close()
        }
    }
}