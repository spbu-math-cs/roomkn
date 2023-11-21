package org.tod87et.roomkn.server

import io.ktor.client.call.body
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import kotlinx.datetime.Instant
import org.junit.jupiter.api.Test
import org.tod87et.roomkn.server.models.reservations.Reservation
import org.tod87et.roomkn.server.models.reservations.ReservationRequest
import org.tod87et.roomkn.server.models.reservations.UnregisteredReservation
import org.tod87et.roomkn.server.models.toRegistered
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import kotlin.time.Duration.Companion.hours

class ReservationsRoutesTests {
    private val apiPath = KtorTestEnv.API_PATH
    private val roomsPath = "$apiPath/rooms"
    private val reservePath = "$apiPath/reserve"
    private val reservationsPath = "$apiPath/reservations"
    private fun reservationPath(id: Int) = "$reservationsPath/$id"

    private fun roomReservationsPath(id: Int) = "$roomsPath/$id/reservations"

    private fun reservationsByRoomPath(id: Int) = "$reservationsPath/by-room/$id"

    private fun reservationsByUserPath(id: Int) = "$reservationsPath/by-user/$id"

    @Test
    fun getRoomReservations() = KtorTestEnv.testJsonApplication { client ->
        val myId = with(KtorTestEnv) {
            client.createAndAuthUser()
        }
        val room = KtorTestEnv.createRoom("301")
        val reservations = prepareAndRegisterReservations(myId, room.id)

        val respReservations = client.get(roomReservationsPath(room.id)).body<List<Reservation>>()
        assertEquals(reservations, respReservations)
    }

    @Test
    fun getReservationsByRoom() = KtorTestEnv.testJsonApplication { client ->
        val myId = with(KtorTestEnv) {
            client.createAndAuthUser()
        }
        val room = KtorTestEnv.createRoom("301")
        val reservations = prepareAndRegisterReservations(myId, room.id)

        val otherRoom = KtorTestEnv.createRoom("302")
        prepareAndRegisterReservations(myId, otherRoom.id, startHour = 24)

        val respReservations = client.get(reservationsByRoomPath(room.id)).body<List<Reservation>>()
        assertEquals(reservations, respReservations)
    }

    @Test
    fun getReservationsByUser() = KtorTestEnv.testJsonApplication { client ->
        val myId = with(KtorTestEnv) {
            client.createAndAuthUser()
        }
        val room = KtorTestEnv.createRoom("301")
        val reservations = prepareAndRegisterReservations(myId, room.id)

        val otherUserId = KtorTestEnv.createUser("Bob")
        prepareAndRegisterReservations(otherUserId, room.id, startHour = 24)

        val respReservations = client.get(reservationsByUserPath(myId)).body<List<Reservation>>()
        assertEquals(reservations, respReservations)
    }

    @Test
    fun reservationsReserve() = KtorTestEnv.testJsonApplication { client ->
        val myId = with(KtorTestEnv) {
            client.createAndAuthUser()
        }
        val room = KtorTestEnv.createRoom("301")

        val reqReservation = ReservationRequest(
            room.id,
            Instant.fromEpochMilliseconds(6.hours.inWholeMilliseconds),
            Instant.fromEpochMilliseconds(7.hours.inWholeMilliseconds)
        )
        val resp = client.post(reservationsPath) {
            contentType(ContentType.Application.Json)
            setBody(reqReservation)
        }.body<Reservation>()

        val expectedReservation = reqReservation.toRegistered(userId = myId, reservationId = resp.id)

        assertEquals(expectedReservation, resp)
        assertEquals(expectedReservation, KtorTestEnv.database.getReservation(resp.id).getOrThrow())
    }

    @Test
    fun reserve() = KtorTestEnv.testJsonApplication { client ->
        val myId = with(KtorTestEnv) {
            client.createAndAuthUser()
        }
        val room = KtorTestEnv.createRoom("301")

        val reqReservation = ReservationRequest(
            room.id,
            Instant.fromEpochMilliseconds(6.hours.inWholeMilliseconds),
            Instant.fromEpochMilliseconds(7.hours.inWholeMilliseconds)
        )
        val resp = client.post(reservePath) {
            contentType(ContentType.Application.Json)
            setBody(reqReservation)
        }.body<Reservation>()

        val expectedReservation = reqReservation.toRegistered(userId = myId, reservationId = resp.id)

        assertEquals(expectedReservation, resp)
        assertEquals(expectedReservation, KtorTestEnv.database.getReservation(resp.id).getOrThrow())
    }

    @Test
    fun deleteReservation() = KtorTestEnv.testJsonApplication { client ->
        val myId = with(KtorTestEnv) {
            client.createAndAuthUser()
        }
        val room = KtorTestEnv.createRoom("301")

        val reqReservation = UnregisteredReservation(
            userId = myId,
            roomId = room.id,
            Instant.fromEpochMilliseconds(6.hours.inWholeMilliseconds),
            Instant.fromEpochMilliseconds(7.hours.inWholeMilliseconds)
        )
        val reservation = KtorTestEnv.database.createReservation(reqReservation).getOrThrow()

        val resp = client.delete(reservationPath(reservation.id))

        assertEquals(HttpStatusCode.OK, resp.status)
        assertTrue(KtorTestEnv.database.getReservation(reservation.id).isFailure)
    }

    @Test
    fun deleteReservationAdmin() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthAdmin()
        }
        val bobId = KtorTestEnv.createUser("Bob")
        val room = KtorTestEnv.createRoom("301")

        val reqReservation = UnregisteredReservation(
            userId = bobId,
            roomId = room.id,
            Instant.fromEpochMilliseconds(6.hours.inWholeMilliseconds),
            Instant.fromEpochMilliseconds(7.hours.inWholeMilliseconds)
        )
        val reservation = KtorTestEnv.database.createReservation(reqReservation).getOrThrow()

        val resp = client.delete(reservationPath(reservation.id))

        assertEquals(HttpStatusCode.OK, resp.status)
        assertTrue(KtorTestEnv.database.getReservation(reservation.id).isFailure)
    }

    @Test
    fun deleteReservationForbidden() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthUser()
        }
        val bobId = KtorTestEnv.createUser("Bob")
        val room = KtorTestEnv.createRoom("301")

        val reqReservation = UnregisteredReservation(
            userId = bobId,
            roomId = room.id,
            Instant.fromEpochMilliseconds(6.hours.inWholeMilliseconds),
            Instant.fromEpochMilliseconds(7.hours.inWholeMilliseconds)
        )
        val reservation = KtorTestEnv.database.createReservation(reqReservation).getOrThrow()

        val resp = client.delete(reservationPath(reservation.id))

        assertEquals(HttpStatusCode.Forbidden, resp.status)
        assertEquals(reservation, KtorTestEnv.database.getReservation(reservation.id).getOrThrow())
    }

    private fun prepareAndRegisterReservations(userId: Int, roomId: Int, startHour: Int = 0): List<Reservation> {
        val dates = listOf(
            Instant.fromEpochMilliseconds(startHour.hours.inWholeMilliseconds),
            Instant.fromEpochMilliseconds((startHour + 3).hours.inWholeMilliseconds),
            Instant.fromEpochMilliseconds((startHour + 5).hours.inWholeMilliseconds),
            Instant.fromEpochMilliseconds((startHour + 7).hours.inWholeMilliseconds),
        )

        return dates.zipWithNext { from, to ->
            KtorTestEnv.database.createReservation(
                UnregisteredReservation(
                    userId,
                    roomId,
                    from,
                    to
                )
            ).getOrThrow()
        }
    }
}
