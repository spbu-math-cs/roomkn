package org.tod87et.roomkn.server.database

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import kotlinx.datetime.Clock
import kotlinx.datetime.Instant
import org.junit.jupiter.api.AfterAll
import javax.sql.DataSource
import org.junit.jupiter.api.Test
import org.tod87et.roomkn.server.models.reservations.UnregisteredReservation
import org.tod87et.roomkn.server.models.rooms.NewRoomInfo
import org.tod87et.roomkn.server.models.users.RegistrationUserInfo
import kotlin.random.Random
import kotlin.time.Duration.Companion.days
import kotlin.time.Duration.Companion.hours
import kotlin.test.assertTrue
import kotlin.test.fail

class ReservationStressTest {
    private val reservationNum = 10000
    private val coroutineNum = 8

    private val lowerBound = Clock.System.now().toEpochMilliseconds()
    private val upperBound = lowerBound + 7.days.inWholeMilliseconds

    private fun createReservation(reservation: UnregisteredReservation) {
        while (true) {
            val exception = database.createReservation(reservation).exceptionOrNull() ?: return

            if (exception is ReservationException) return

            if (exception !is SerializationException) {
                fail("Unexpected exception: $exception")
            }
        }
    }

    @Test
    fun stressTest() {
        val reservationsPerCoroutine = reservationNum / coroutineNum
        val userInfo = RegistrationUserInfo("user", "email", byteArrayOf(1), byteArrayOf(1))
        val userId = database.registerUser(userInfo).getOrThrow().id
        val roomId = database.createRoom(NewRoomInfo("name", "description")).getOrThrow().id
        val reservations = List(reservationNum) {
            val from = Random.nextLong(lowerBound, upperBound)
            val until = Random.nextLong(from + 1, from + 1.hours.inWholeMilliseconds)
            UnregisteredReservation(
                userId,
                roomId,
                Instant.fromEpochMilliseconds(from),
                Instant.fromEpochMilliseconds(until)
            )
        }

        runBlocking(Dispatchers.Default) {
            reservations.chunked(reservationsPerCoroutine).forEach { coroutineReservations ->
                launch {
                    coroutineReservations.forEach { createReservation(it) }
                }
            }
        }

        val sortedReservations = reservations.sortedWith(compareBy({ it.from }, { it.until }))
        val acceptedReservations = database.getRoomReservations(roomId)
            .getOrThrow()
            .sortedWith(compareBy({ it.from }, { it.until }))

        acceptedReservations.dropLast(1).zip(acceptedReservations.drop(1)).forEach { (cur, next) ->
            assertTrue(cur.until <= next.from)
        }

        var idx = 0

        for (reservation in sortedReservations) {
            val from = reservation.from
            val until = reservation.until

            while (idx < acceptedReservations.size && acceptedReservations[idx].until <= from) { idx++ }
            if (idx == acceptedReservations.size) break

            if (until <= acceptedReservations[idx].from) {
                fail("Can reserve")
            }
        }
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