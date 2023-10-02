package org.tod87et.roomkn.server.database

import java.sql.Connection
import kotlinx.datetime.Instant
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction

class Db(url: String, driver: String, user: String, password: String) {
    private val database: Database = Database.connect(
        url = url,
        driver = driver,
        user = user,
        password = password,
    )

    init {
        transaction(database) { SchemaUtils.create(Users, Rooms, Reservations) }
    }

    fun registerUser(username: String, email: String): UserEntry = transaction(database) {
        val id = Users.insert {
            it[Users.username] = username
            it[Users.email] = email
        } get Users.id

        UserEntry(id, username, email)
    }

    fun createRoom(name: String, description: String): RoomEntry = transaction(database) {
        val id = Rooms.insert {
            it[Rooms.name] = name
            it[Rooms.description] = description
        } get Rooms.id

        RoomEntry(id, name, description)
    }

    fun listRooms(): List<RoomEntry> = transaction(database) {
        Rooms.selectAll().map { RoomEntry(it[Rooms.id], it[Rooms.name], it[Rooms.description]) }
    }

    fun createReservation(userId: Int, roomId: Int, from: Instant, until: Instant): ReservationEntry? {
        require(until > from) { "Until must be later than from" }

        return transaction(db = database, transactionIsolation = Connection.TRANSACTION_SERIALIZABLE) {
            val cnt = Reservations.select {
                val intersectionCondition = (Reservations.until greater from) and (Reservations.from less until)
                val roomCondition = Reservations.roomId eq roomId

                roomCondition and intersectionCondition
            }.count()

            if (cnt > 0) return@transaction null

            val id = Reservations.insert {
                it[Reservations.userId] = userId
                it[Reservations.roomId] = roomId
                it[Reservations.from] = from
                it[Reservations.until] = until
            } get Reservations.id

            ReservationEntry(id, userId, roomId, from, until)
        }
    }

    fun listReservation(): List<ReservationEntry> = transaction(database) {
        Reservations.selectAll().map {
            ReservationEntry(
                id = it[Reservations.id],
                userId = it[Reservations.userId],
                roomId = it[Reservations.roomId],
                from = it[Reservations.from],
                until = it[Reservations.until]
            )
        }
    }

}