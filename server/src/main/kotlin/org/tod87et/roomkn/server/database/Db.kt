package org.tod87et.roomkn.server.database

import kotlinx.datetime.Instant
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.tod87et.roomkn.server.models.Reservation
import org.tod87et.roomkn.server.models.RoomInfo
import org.tod87et.roomkn.server.models.UserInfo
import java.sql.Connection
import javax.sql.DataSource

class Db private constructor(private val database: Database) {

    constructor(url: String, driver: String, user: String, password: String) : this(
        Database.connect(
            url = url,
            driver = driver,
            user = user,
            password = password,
        )
    )

    constructor(dataSource: DataSource) : this(Database.connect(dataSource))

    init {
        transaction(database) { SchemaUtils.create(Users, Rooms, Reservations) }
    }

    fun registerUser(username: String, email: String): UserInfo = transaction(database) {
        val id = Users.insert {
            it[Users.username] = username
            it[Users.email] = email
        } get Users.id

        UserInfo(id, username, email)
    }

    fun createRoom(name: String, description: String): RoomInfo = transaction(database) {
        val id = Rooms.insert {
            it[Rooms.name] = name
            it[Rooms.description] = description
        } get Rooms.id

        RoomInfo(id, name, description)
    }

    fun listRooms(): List<RoomInfo> = transaction(database) {
        Rooms.selectAll().map { RoomInfo(it[Rooms.id], it[Rooms.name], it[Rooms.description]) }
    }

    fun createReservation(userId: Int, roomId: Int, from: Instant, until: Instant): Reservation? {
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

            Reservation(id, userId, roomId, from, until)
        }
    }

    fun listReservation(): List<Reservation> = transaction(database) {
        Reservations.selectAll().map {
            Reservation(
                id = it[Reservations.id],
                userId = it[Reservations.userId],
                roomId = it[Reservations.roomId],
                from = it[Reservations.from],
                until = it[Reservations.until]
            )
        }
    }

}