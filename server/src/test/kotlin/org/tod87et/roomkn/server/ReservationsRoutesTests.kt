package org.tod87et.roomkn.server

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.client.statement.HttpResponse
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import kotlinx.datetime.Clock
import kotlinx.datetime.Instant
import org.junit.jupiter.api.Test
import org.tod87et.roomkn.server.models.reservations.MultipleReservationResult
import org.tod87et.roomkn.server.models.reservations.NewReservationBounds
import org.tod87et.roomkn.server.models.reservations.Reservation
import org.tod87et.roomkn.server.models.reservations.ReservationRequest
import org.tod87et.roomkn.server.models.reservations.UnregisteredReservation
import org.tod87et.roomkn.server.models.toRegistered
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import kotlin.time.Duration.Companion.days
import kotlin.time.Duration.Companion.hours
import kotlin.time.Duration.Companion.minutes

class ReservationsRoutesTests {
    private val apiPath = KtorTestEnv.API_PATH
    private val roomsPath = "$apiPath/rooms"
    private val reservePath = "$apiPath/reserve"
    private val reserveMultiplePath = "$apiPath/reserve/multiple"
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
    fun getAllReservations() = KtorTestEnv.testJsonApplication { client ->
        val myId = with(KtorTestEnv) {
            client.createAndAuthUser("Alice")
        }
        val otherId = KtorTestEnv.createUser("Bob")
        val room301Id = KtorTestEnv.createRoom("301").id
        val room302Id = KtorTestEnv.createRoom("302").id
        val timestamp = Instant.parse("2023-12-07T00:00:00+00:00")
        val reserveMyIdRoom301FirstHalf = KtorTestEnv.database.createReservation(
            UnregisteredReservation(
                myId,
                room301Id,
                timestamp,
                timestamp + 1.hours
            )
        ).getOrThrow()
        val reserveMyIdRoom302SecondHalf = KtorTestEnv.database.createReservation(
            UnregisteredReservation(
                myId,
                room302Id,
                timestamp + 1.hours,
                timestamp + 2.hours
            )
        ).getOrThrow()
        val reserveOtherIdRoom302FirstHalf = KtorTestEnv.database.createReservation(
            UnregisteredReservation(
                otherId,
                room302Id,
                timestamp,
                timestamp + 1.hours
            )
        ).getOrThrow()
        val reserveOtherIdRoom301SecondHalf = KtorTestEnv.database.createReservation(
            UnregisteredReservation(
                otherId,
                room301Id,
                Instant.parse("3000-01-19T00:00:00+00:00") + 1.hours,
                Instant.parse("3000-01-19T00:00:00+00:00") + 2.hours
            )
        ).getOrThrow()
        var bodyResponse = client.getRequestForAllReservationsWithQueryParams().body<List<Reservation>>()
        assertEquals(
            setOf(
                reserveMyIdRoom301FirstHalf,
                reserveMyIdRoom302SecondHalf,
                reserveOtherIdRoom302FirstHalf,
                reserveOtherIdRoom301SecondHalf
            ),
            bodyResponse.toSet(),
            "Expect every reservations with empty queries"
        )
        bodyResponse = client.getRequestForAllReservationsWithQueryParams(
            userIds = listOf(myId)
        ).body<List<Reservation>>()
        assertEquals(
            setOf(reserveMyIdRoom301FirstHalf, reserveMyIdRoom302SecondHalf),
            bodyResponse.toSet(),
            "Expect only reservations with my user id"
        )
        bodyResponse = client.getRequestForAllReservationsWithQueryParams(
            userIds = listOf(otherId)
        ).body<List<Reservation>>()
        assertEquals(
            setOf(reserveOtherIdRoom301SecondHalf, reserveOtherIdRoom302FirstHalf),
            bodyResponse.toSet(),
            "Expect only reservations with other user id"
        )

        bodyResponse = client.getRequestForAllReservationsWithQueryParams(
            roomIds = listOf(room301Id)
        ).body<List<Reservation>>()
        assertEquals(
            setOf(reserveMyIdRoom301FirstHalf, reserveOtherIdRoom301SecondHalf),
            bodyResponse.toSet(),
            "Expect only reservations with 301 room"
        )
        bodyResponse = client.getRequestForAllReservationsWithQueryParams(
            roomIds = listOf(room302Id)
        ).body<List<Reservation>>()
        assertEquals(
            setOf(reserveOtherIdRoom302FirstHalf, reserveMyIdRoom302SecondHalf),
            bodyResponse.toSet(),
            "Expect only reservations with 302 room"
        )

        bodyResponse = client.getRequestForAllReservationsWithQueryParams(
            until = timestamp + 30.minutes
        ).body<List<Reservation>>()
        assertEquals(
            setOf(reserveMyIdRoom301FirstHalf, reserveOtherIdRoom302FirstHalf),
            bodyResponse.toSet(),
            "Expect only reservations which start before ${timestamp + 30.minutes}"
        )
        bodyResponse = client.getRequestForAllReservationsWithQueryParams(
            from = timestamp + 90.minutes
        ).body<List<Reservation>>()
        assertEquals(
            setOf(reserveOtherIdRoom301SecondHalf, reserveMyIdRoom302SecondHalf),
            bodyResponse.toSet(),
            "Expect only reservations which end after ${timestamp + 90.minutes}"
        )
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
        val now = Clock.System.now()
        val me = with(KtorTestEnv) {
            client.createAndAuthUserWithInfo()
        }
        val room = KtorTestEnv.createRoom("301")

        val reqReservation = ReservationRequest(
            room.id,
            now + 6.hours,
            now + 7.hours
        )
        val resp = client.post(reservationsPath) {
            contentType(ContentType.Application.Json)
            setBody(reqReservation)
        }.body<Reservation>()

        val expectedReservation =
            reqReservation.toRegistered(
                userId = me.id,
                reservationId = resp.id,
                userName = me.username,
                roomName = room.name
            )

        assertEquals(expectedReservation, resp)
        assertEquals(expectedReservation, KtorTestEnv.database.getReservation(resp.id).getOrThrow())
    }

    @Test
    fun reserve() = KtorTestEnv.testJsonApplication { client ->
        val now = Clock.System.now()
        val me = with(KtorTestEnv) {
            client.createAndAuthUserWithInfo()
        }
        val room = KtorTestEnv.createRoom("301")

        val reqReservation = ReservationRequest(
            room.id,
            now + 6.hours,
            now + 7.hours
        )
        val resp = client.post(reservePath) {
            contentType(ContentType.Application.Json)
            setBody(reqReservation)
        }.body<Reservation>()

        val expectedReservation = reqReservation.toRegistered(
            userId = me.id,
            reservationId = resp.id,
            userName = me.username,
            roomName = room.name
        )

        assertEquals(expectedReservation, resp)
        assertEquals(expectedReservation, KtorTestEnv.database.getReservation(resp.id).getOrThrow())
    }

    @Test
    fun reserveMultipleOk() = KtorTestEnv.testJsonApplication { client ->
        val now = Clock.System.now()
        val me = with(KtorTestEnv) {
            client.createAndAuthUserWithInfo()
        }
        val room = KtorTestEnv.createRoom("301")

        val reqReservations = listOf(
            ReservationRequest(
                room.id,
                now + 6.hours,
                now + 7.hours
            ),
            ReservationRequest(
                room.id,
                now + 7.hours,
                now + 8.hours
            ),
        )
        val resp = client.post(reserveMultiplePath) {
            contentType(ContentType.Application.Json)
            setBody(reqReservations)
        }.body<MultipleReservationResult>()

        assertEquals(2, resp.success.size)
        assertEquals(0, resp.failure.size)

        val expectedReservations = reqReservations.mapIndexed { idx, it ->
            it.toRegistered(
                userId = me.id,
                userName = me.username,
                reservationId = resp.success[idx].id,
                roomName = room.name,
            )
        }

        assertEquals(expectedReservations, resp.success)
        expectedReservations.forEach { reservation ->
            assertEquals(
                reservation,
                KtorTestEnv.database.getReservation(reservation.id).getOrThrow()
            )
        }
    }

    @Test
    fun reserveMultipleOkFail() = KtorTestEnv.testJsonApplication { client ->
        val now = Clock.System.now()

        val me = with(KtorTestEnv) {
            client.createAndAuthUserWithInfo()
        }
        val room = KtorTestEnv.createRoom("301")

        val reqReservations = listOf(
            ReservationRequest(
                room.id,
                now + 6.hours,
                now + 7.hours
            ),
            ReservationRequest(
                room.id,
                now + 6.hours,
                now + 8.hours
            ),
        )
        val resp = client.post(reserveMultiplePath) {
            contentType(ContentType.Application.Json)
            setBody(reqReservations)
        }.body<MultipleReservationResult>()

        assertEquals(1, resp.success.size)
        assertEquals(1, resp.failure.size)

        val expectedReservation =
            reqReservations[0].toRegistered(
                userId = me.id,
                userName = me.username,
                reservationId = resp.success[0].id,
                roomName = room.name,
            )

        assertEquals(expectedReservation, resp.success.first())

        assertEquals(
            expectedReservation,
            KtorTestEnv.database.getReservation(expectedReservation.id).getOrThrow()
        )
    }

    @Test
    fun reserveMultipleFail() = KtorTestEnv.testJsonApplication { client ->
        val now = Clock.System.now()
        val myId = with(KtorTestEnv) {
            client.createAndAuthUser()
        }
        val room = KtorTestEnv.createRoom("301")

        KtorTestEnv.database.createReservation(
            UnregisteredReservation(
                myId,
                room.id,
                now + 6.hours,
                now + 8.hours
            )
        )

        val reqReservations = listOf(
            ReservationRequest(
                room.id,
                now + 6.hours,
                now + 7.hours
            ),
            ReservationRequest(
                room.id,
                now + 7.hours,
                now + 8.hours
            ),
        )
        val resp = client.post(reserveMultiplePath) {
            contentType(ContentType.Application.Json)
            setBody(reqReservations)
        }.body<MultipleReservationResult>()

        assertEquals(0, resp.success.size)
        assertEquals(2, resp.failure.size)
    }

    @Test
    fun reserveTooLongFail() = KtorTestEnv.testJsonApplication { client ->
        val now = Clock.System.now()
        with(KtorTestEnv) {
            client.createAndAuthUser()
        }
        val room = KtorTestEnv.createRoom("301")

        val reqReservation = ReservationRequest(
            room.id,
            now + 6.hours,
            now + 10.days
        )
        val resp = client.post(reservePath) {
            contentType(ContentType.Application.Json)
            setBody(reqReservation)
        }
        assertEquals(HttpStatusCode.Forbidden, resp.status)
    }

    @Test
    fun reserveInPastFail() = KtorTestEnv.testJsonApplication { client ->
        val now = Clock.System.now()
        with(KtorTestEnv) {
            client.createAndAuthUser()
        }
        val room = KtorTestEnv.createRoom("301")

        val reqReservation = ReservationRequest(
            room.id,
            now - 10.days,
            now - 10.days + 1.hours
        )
        val resp = client.post(reservePath) {
            contentType(ContentType.Application.Json)
            setBody(reqReservation)
        }
        assertEquals(HttpStatusCode.Forbidden, resp.status)
    }

    @Test
    fun reserveInFutureFail() = KtorTestEnv.testJsonApplication { client ->
        val now = Clock.System.now()
        with(KtorTestEnv) {
            client.createAndAuthUser()
        }
        val room = KtorTestEnv.createRoom("301")

        val reqReservation = ReservationRequest(
            room.id,
            now + 100.days,
            now + 100.days + 1.hours
        )
        val resp = client.post(reservePath) {
            contentType(ContentType.Application.Json)
            setBody(reqReservation)
        }
        assertEquals(HttpStatusCode.Forbidden, resp.status)
    }

    @Test
    fun reserveInFutureAdmin() = KtorTestEnv.testJsonApplication { client ->
        val now = Clock.System.now()
        with(KtorTestEnv) {
            client.createAndAuthAdmin()
        }
        val room = KtorTestEnv.createRoom("301")

        val reqReservation = ReservationRequest(
            room.id,
            now + 100.days,
            now + 100.days + 1.hours
        )
        val resp = client.post(reservePath) {
            contentType(ContentType.Application.Json)
            setBody(reqReservation)
        }
        assertEquals(HttpStatusCode.Created, resp.status)
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
    fun updateReservation() = KtorTestEnv.testJsonApplication { client ->
        val myId = with(KtorTestEnv) {
            client.createAndAuthUser()
        }
        val room = KtorTestEnv.createRoom("301")

        val from = Instant.fromEpochMilliseconds(6.hours.inWholeMilliseconds)
        val until = Instant.fromEpochMilliseconds(7.hours.inWholeMilliseconds)
        val untilEps = until + 1.hours
        val fromEps = from - 1.hours

        val reqReservation = UnregisteredReservation(myId, room.id, from, until)
        val secondReservation = UnregisteredReservation(myId, room.id, until, untilEps)
        val reservation = KtorTestEnv.database.createReservation(reqReservation).getOrThrow()
        assertTrue(KtorTestEnv.database.createReservation(secondReservation).isSuccess)

        var resp = client.put(reservationPath(reservation.id)) {
            contentType(ContentType.Application.Json)
            setBody(NewReservationBounds(from, untilEps))
        }

        assertEquals(HttpStatusCode.Conflict, resp.status)

        resp = client.put(reservationPath(reservation.id)) {
            contentType(ContentType.Application.Json)
            setBody(NewReservationBounds(fromEps, until))
        }
        assertEquals(HttpStatusCode.OK, resp.status)
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

    private suspend fun HttpClient.getRequestForAllReservationsWithQueryParams(
        userIds: List<Int>? = null,
        roomIds: List<Int>? = null,
        from: Instant? = null,
        until: Instant? = null,
    ): HttpResponse {
        return this.get(reservationsPath) {
            url {
                if (userIds != null) {
                    parameters.append("user_ids", userIds.joinToString(","))
                }
                if (roomIds != null) {
                    parameters.append("room_ids", roomIds.joinToString(","))
                }
                if (from != null) {
                    parameters.append("from", from.toString())
                }
                if (until != null) {
                    parameters.append("until", until.toString())
                }
            }
        }
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
