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
import kotlin.time.Duration.Companion.minutes

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
        assertTrue(database.getRoom(incorrectId).exceptionOrNull() is MissingElementException)
    }

    @Test
    fun usersApiTest() {
        val user1 = RegistrationUserInfo("user1", "email1", byteArrayOf(1), byteArrayOf(2))
        val user2 = RegistrationUserInfo("user2", "email2", byteArrayOf(3), byteArrayOf(4))

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
        assertTrue(database.getUser(incorrectId).exceptionOrNull() is MissingElementException)

        val incorrectUser = RegistrationUserInfo(user1.username, "email3", byteArrayOf(5), byteArrayOf(6))
        assertTrue(database.registerUser(incorrectUser).exceptionOrNull() is ConstraintViolationException)
    }

    @Test
    fun credentialsApiTest() {
        val user = RegistrationUserInfo("user", "email", byteArrayOf(1), byteArrayOf(2))

        database.registerUser(user)

        val credentialsByEmail = database.getCredentialsInfoByEmail(user.email).getOrThrow()
        val credentialsByUsername = database.getCredentialsInfoByUsername(user.username).getOrThrow()

        assertContentEquals(user.passwordHash, credentialsByEmail.passwordHash)
        assertContentEquals(user.salt, credentialsByEmail.salt)
        assertContentEquals(user.passwordHash, credentialsByUsername.passwordHash)
        assertContentEquals(user.salt, credentialsByUsername.salt)
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

        assertTrue(database.createReservation(invalidReservation).exceptionOrNull() is ConstraintViolationException)

        val reservation1 = UnregisteredReservation(userInfo.id, room1Info.id, from, until)
        val reservation2 = UnregisteredReservation(userInfo.id, room2Info.id, from, until)

        assertTrue(database.createReservation(reservation1).isSuccess)
        assertTrue(database.createReservation(reservation2).isSuccess)

        assertTrue(database.createReservation(reservation1).exceptionOrNull() is ReservationException)

        val room1Reservations = database.getRoomReservations(room1Info.id).getOrThrow()
        val expectedReservation = Reservation(
            room1Reservations.first().id,
            userInfo.id,
            room1Info.id,
            from,
            until
        )

        assertEquals(listOf(expectedReservation), room1Reservations)
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