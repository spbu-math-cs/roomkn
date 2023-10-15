package org.tod87et.roomkn.server.database

import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.tod87et.roomkn.server.models.RegistrationUserInfo
import org.tod87et.roomkn.server.models.Reservation
import org.tod87et.roomkn.server.models.RoomInfo
import org.tod87et.roomkn.server.models.ShortRoomInfo
import org.tod87et.roomkn.server.models.ShortUserInfo
import org.tod87et.roomkn.server.models.UnregisteredReservation
import org.tod87et.roomkn.server.models.UserCredentialsInfo
import org.tod87et.roomkn.server.models.UserInfo
import java.sql.Connection
import javax.sql.DataSource
import org.tod87et.roomkn.server.database.Database as RooMknDatabase
import org.jetbrains.exposed.exceptions.ExposedSQLException
import org.jetbrains.exposed.sql.deleteAll
import org.postgresql.util.PSQLException
import org.tod87et.roomkn.server.models.NewRoomInfo

class DatabaseSession private constructor(private val database: Database) :
    RooMknDatabase, CredentialsDatabase {

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

    override fun createRoom(roomInfo: NewRoomInfo): Result<RoomInfo> = queryWrapper {
        transaction(database) {
            val roomRow = Rooms.insert {
                it[name] = roomInfo.name
                it[description] = roomInfo.description
            }

            RoomInfo(roomRow[Rooms.id], roomRow[Rooms.name], roomRow[Rooms.description])
        }
    }

    override fun getRooms(): Result<List<ShortRoomInfo>> = queryWrapper {
        transaction(database) {
            Rooms.selectAll().map { ShortRoomInfo(it[Rooms.id], it[Rooms.name]) }
        }
    }

    override fun getRoom(roomId: Int): Result<RoomInfo> = queryWrapper {
        transaction(database) {
            val roomRow = Rooms.select { Rooms.id eq roomId }.firstOrNull() ?: throw MissingElementException()

            RoomInfo(
                roomRow[Rooms.id],
                roomRow[Rooms.name],
                roomRow[Rooms.description]
            )
        }
    }

    override fun getRoomReservations(roomId: Int): Result<List<Reservation>> = queryWrapper {
        transaction(database) {
            if (Rooms.select { Rooms.id eq roomId }.empty()) {
                throw MissingElementException()
            }

            Reservations
                .select { Reservations.roomId eq roomId }
                .map {
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

    override fun createReservation(reserve: UnregisteredReservation): Result<Reservation> = queryWrapper {
        require(reserve.until > reserve.from) { "Until must be later than from" }

        val from = reserve.from
        val until = reserve.until
        val roomId = reserve.roomId
        val userId = reserve.userId

        transaction(db = database, transactionIsolation = Connection.TRANSACTION_SERIALIZABLE) {
            val cnt = Reservations.select {
                val intersectionCondition = (Reservations.until greater from) and (Reservations.from less until)
                val roomCondition = Reservations.roomId eq roomId

                roomCondition and intersectionCondition
            }.count()

            if (cnt > 0) throw ReservationException()

            val id = Reservations.insert {
                it[Reservations.userId] = userId
                it[Reservations.roomId] = roomId
                it[Reservations.from] = from
                it[Reservations.until] = until
            } get Reservations.id

            Reservation(id, userId, roomId, from, until)
        }
    }

    override fun getUsers(): Result<List<ShortUserInfo>> = queryWrapper {
        transaction(database) {
            Users.selectAll().map { ShortUserInfo(it[Users.id], it[Users.username]) }
        }
    }

    override fun getUser(userId: Int): Result<UserInfo> = queryWrapper {
        transaction(database) {
            val roomRow = Users.select { Users.id eq userId }.firstOrNull() ?: throw MissingElementException()

            UserInfo(
                roomRow[Users.id],
                roomRow[Users.username],
                roomRow[Users.email]
            )
        }
    }

    override fun registerUser(user: RegistrationUserInfo): Result<UserInfo> = queryWrapper {
        transaction(database) {
            val userRow = Users.insert {
                it[username] = user.username
                it[email] = user.email
                it[salt] = user.salt
                it[passwordHash] = user.passwordHash
            }

            UserInfo(userRow[Users.id], userRow[Users.username], userRow[Users.email])
        }
    }

    override fun getCredentialsInfoByEmail(email: String): Result<UserCredentialsInfo> = queryWrapper {
        transaction(database) {
            val userRow = Users.select { Users.email eq email }.firstOrNull() ?: throw MissingElementException()

            UserCredentialsInfo(
                userRow[Users.id],
                userRow[Users.salt],
                userRow[Users.passwordHash]
            )
        }
    }

    override fun getCredentialsInfoByUsername(username: String): Result<UserCredentialsInfo> = queryWrapper {
        transaction(database) {
            val userRow = Users.select { Users.username eq username }.firstOrNull() ?: throw MissingElementException()

            UserCredentialsInfo(
                userRow[Users.id],
                userRow[Users.salt],
                userRow[Users.passwordHash]
            )
        }
    }

    /**
     * Clear database for TEST/DEBUG purpose
     */
    override fun clear(): Result<Unit> = queryWrapper {
        transaction(database) {
            Reservations.deleteAll()
            Users.deleteAll()
            Rooms.deleteAll()
        }
    }

    /**
     * For PostgreSQL only
     *
     * @see <a href="https://www.postgresql.org/docs/current/errcodes-appendix.html">PostgreSQL error codes</a>
     */
    private fun ExposedSQLException.isConnectionException() = sqlState.startsWith("08")
    /**
     * For PostgreSQL only
     *
     * @see <a href="https://www.postgresql.org/docs/current/errcodes-appendix.html">PostgreSQL error codes</a>
     */
    private fun ExposedSQLException.isConstraintViolation() = sqlState.startsWith("23")

    private fun mapConstraintViolationException(e: ExposedSQLException): DatabaseException {
        val cause = e.cause ?: return UnknownException(e)
        if (cause !is PSQLException) return UnknownException(e)
        val constraintStr = cause.serverErrorMessage?.constraint ?: return UnknownException(e)

        val constraint = when (constraintStr.substringAfterLast("_")) {
            "username" -> ConstraintViolationException.Constraint.USERNAME
            "email" -> ConstraintViolationException.Constraint.EMAIL
            "userid" -> ConstraintViolationException.Constraint.USER_ID
            "roomid" -> ConstraintViolationException.Constraint.ROOM_ID
            else -> return UnknownException(e)
        }

        return ConstraintViolationException(constraint, e)
    }

    private inline fun <T> queryWrapper(queryBody: () -> T): Result<T> =
        runCatching { queryBody() }
            .onFailure { e ->
                val mappedException = when {
                    e is DatabaseException -> e
                    e !is ExposedSQLException -> UnknownException(e)
                    e.isConnectionException() -> ConnectionException(e)
                    e.isConstraintViolation() -> mapConstraintViolationException(e)
                    else -> UnknownException(e)
                }

                return Result.failure(mappedException)
            }
}