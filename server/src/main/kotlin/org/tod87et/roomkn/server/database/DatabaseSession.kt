package org.tod87et.roomkn.server.database

import kotlinx.datetime.Clock
import kotlinx.datetime.Instant
import org.jetbrains.exposed.exceptions.ExposedSQLException
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.SortOrder
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.lessEq
import org.jetbrains.exposed.sql.Transaction
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.deleteAll
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import org.jetbrains.exposed.sql.upsert
import org.postgresql.util.PSQLException
import org.tod87et.roomkn.server.database.InvalidatedTokens.tokenHash
import org.tod87et.roomkn.server.models.permissions.UserPermission
import org.tod87et.roomkn.server.models.reservations.Reservation
import org.tod87et.roomkn.server.models.reservations.UnregisteredReservation
import org.tod87et.roomkn.server.models.rooms.NewRoomInfo
import org.tod87et.roomkn.server.models.rooms.RoomInfo
import org.tod87et.roomkn.server.models.rooms.ShortRoomInfo
import org.tod87et.roomkn.server.models.users.RegistrationUserInfo
import org.tod87et.roomkn.server.models.users.ShortUserInfo
import org.tod87et.roomkn.server.models.users.UpdateUserInfo
import org.tod87et.roomkn.server.models.users.UserCredentialsInfo
import org.tod87et.roomkn.server.models.users.UserInfo
import java.sql.Connection
import javax.sql.DataSource
import org.tod87et.roomkn.server.database.Database as RooMknDatabase

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
        transaction(database) { SchemaUtils.create(Users, Rooms, Reservations, InvalidatedTokens) }
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

    override fun updateRoom(roomId: Int, roomInfo: NewRoomInfo): Result<Unit> = queryWrapper {
        transaction(database) {
            val cnt = Rooms.update({ Rooms.id eq roomId }) {
                it[name] = roomInfo.name
                it[description] = roomInfo.description
            }

            if (cnt == 0) throw MissingElementException()
        }
    }

    override fun deleteRoom(roomId: Int): Result<Unit> = queryWrapper {
        transaction(database) {
            val cnt = Rooms.deleteWhere { id eq roomId }

            if (cnt == 0) throw MissingElementException()
        }
    }

    override fun getRooms(limit: Int, offset: Long): Result<List<ShortRoomInfo>> = queryWrapper {
        transaction(database) {
            Rooms.selectAll()
                .orderBy(Rooms.name to SortOrder.ASC, Rooms.id to SortOrder.ASC)
                .limit(limit, offset)
                .map { ShortRoomInfo(it[Rooms.id], it[Rooms.name]) }
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

    override fun getRoomReservations(roomId: Int, limit: Int, offset: Long): Result<List<Reservation>> = queryWrapper {
        transaction(database) {
            if (Rooms.select { Rooms.id eq roomId }.empty()) {
                throw MissingElementException()
            }

            Reservations
                .select { Reservations.roomId eq roomId }
                .orderBy(Reservations.from to SortOrder.ASC, Reservations.until to SortOrder.ASC)
                .limit(limit, offset)
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

    override fun getUserReservations(userId: Int, limit: Int, offset: Long): Result<List<Reservation>> = queryWrapper {
        transaction(database) {
            if (Users.select { Users.id eq userId }.empty()) {
                throw MissingElementException()
            }

            Reservations
                .select { Reservations.userId eq userId }
                .orderBy(Reservations.from to SortOrder.ASC, Reservations.until to SortOrder.ASC)
                .limit(limit, offset)
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

    private fun Transaction.tryCreateReservation(reservation: UnregisteredReservation): Reservation? {
        val from = reservation.from
        val until = reservation.until
        val roomId = reservation.roomId
        val userId = reservation.userId

        val cnt = Reservations.select {
            val intersectionCondition = (Reservations.until greater from) and (Reservations.from less until)
            val roomCondition = Reservations.roomId eq roomId

            roomCondition and intersectionCondition
        }.count()

        if (cnt > 0) return null

        val id = Reservations.insert {
            it[Reservations.userId] = userId
            it[Reservations.roomId] = roomId
            it[Reservations.from] = from
            it[Reservations.until] = until
        } get Reservations.id

        return Reservation(id, userId, roomId, from, until)
    }

    override fun createReservation(reservation: UnregisteredReservation): Result<Reservation> = queryWrapper {
        require(reservation.until > reservation.from) { "Until must be later than from" }

        transaction(db = database, transactionIsolation = Connection.TRANSACTION_SERIALIZABLE) {
            tryCreateReservation(reservation) ?: throw ReservationException()
        }
    }

    override fun getReservation(reservationId: Int): Result<Reservation> = queryWrapper {
        transaction(database) {
            val row = Reservations.select { Reservations.id eq reservationId }.firstOrNull()
                ?: throw MissingElementException()

            Reservation(
                row[Reservations.id],
                row[Reservations.userId],
                row[Reservations.roomId],
                row[Reservations.from],
                row[Reservations.until],
            )
        }
    }

    override fun updateReservation(reservationId: Int, from: Instant, until: Instant): Result<Unit> = queryWrapper {
        require(until > from) { "Until must be later than from" }

        transaction(db = database, transactionIsolation = Connection.TRANSACTION_SERIALIZABLE) {
            val reservationRow = Reservations
                .select { Reservations.id eq reservationId }
                .firstOrNull() ?: throw MissingElementException()
            val userId = reservationRow[Reservations.userId]
            val roomId = reservationRow[Reservations.roomId]

            Reservations.deleteWhere { id eq reservationId }

            val updatedReservation = tryCreateReservation(UnregisteredReservation(userId, roomId, from, until))

            if (updatedReservation == null) {
                rollback()
                throw ReservationException()
            }
        }
    }

    override fun deleteReservation(reservationId: Int): Result<Unit> = queryWrapper {
        transaction(database) {
            val cnt = Reservations.deleteWhere { id eq reservationId }

            if (cnt == 0) throw MissingElementException()
        }
    }

    override fun getUsers(limit: Int, offset: Long): Result<List<ShortUserInfo>> = queryWrapper {
        transaction(database) {
            Users.selectAll()
                .orderBy(Users.username to SortOrder.ASC, Users.id to SortOrder.ASC)
                .limit(limit, offset)
                .map { ShortUserInfo(it[Users.id], it[Users.username]) }
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

    override fun getUserPermissions(userId: Int): Result<List<UserPermission>> = queryWrapper {
        transaction(database) {
            val usersRow = Users.select { Users.id eq userId }.singleOrNull() ?: throw MissingElementException()
            val permissionsMask = usersRow[Users.permissions]

            maskToPermissions(permissionsMask)
        }
    }

    override fun updateUserPermissions(userId: Int, permissions: List<UserPermission>): Result<Unit> = queryWrapper {
        transaction(database) {
            val cnt = Users.update({ Users.id eq userId }) {
                it[Users.permissions] = permissionsToMask(permissions)
            }

            if (cnt == 0) throw MissingElementException()
        }
    }

    override fun registerUser(user: RegistrationUserInfo): Result<UserInfo> = queryWrapper {
        transaction(database) {
            val userRow = Users.insert {
                it[username] = user.username
                it[email] = user.email
                it[salt] = user.salt
                it[passwordHash] = user.passwordHash
                it[permissions] = permissionsToMask(user.permissions)
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

    override fun invalidateToken(hash: ByteArray, expirationDate: Instant): Result<Unit> = queryWrapper {
        transaction(database) {
            InvalidatedTokens.upsert {
                it[InvalidatedTokens.tokenHash] = hash
                it[InvalidatedTokens.expirationDate] = expirationDate
            }
        }
    }

    override fun checkTokenWasInvalidated(hash: ByteArray): Result<Boolean> = queryWrapper {
        transaction(database) {
            !InvalidatedTokens.select { tokenHash eq hash }.empty()
        }
    }

    override fun cleanupExpiredInvalidatedTokens(): Result<Unit> = queryWrapper {
        transaction(database) {
            val now = Clock.System.now()

            InvalidatedTokens.deleteWhere { expirationDate lessEq now }
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

    override fun updateUserPassword(
        userId: Int,
        passwordHash: ByteArray,
        salt: ByteArray
    ): Result<Unit> = queryWrapper {
        transaction(database) {
            val cnt = Users.update({ Users.id eq userId }) {
                it[Users.passwordHash] = passwordHash
                it[Users.salt] = salt
            }

            if (cnt == 0) throw MissingElementException()
        }
    }

    override fun updateUserInfo(userId: Int, info: UpdateUserInfo): Result<Unit> = queryWrapper {
        transaction(database) {
            val cnt = Users.update({ Users.id eq userId }) {
                it[Users.username] = info.username
                it[Users.email] = info.email
            }

            if (cnt == 0) throw MissingElementException()
        }
    }

    override fun deleteUser(userId: Int): Result<Unit> = queryWrapper {
        transaction(database) {
            val cnt = Users.deleteWhere { id eq userId }

            if (cnt == 0) throw MissingElementException()
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
    private fun Throwable.isSerializationFailure(): Boolean =
        this is PSQLException && sqlState == "40001" || this is ExposedSQLException && sqlState == "40001"

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
                    e.isSerializationFailure() -> SerializationException()
                    e !is ExposedSQLException -> UnknownException(e)
                    e.isConnectionException() -> ConnectionException(e)
                    e.isConstraintViolation() -> mapConstraintViolationException(e)
                    else -> UnknownException(e)
                }

                return Result.failure(mappedException)
            }

    private fun permissionsToMask(permissions: List<UserPermission>): ULong =
        permissions.fold(0uL) { acc, permission ->
            acc + (1uL shl permission.id)
        }

    private fun maskToPermissions(mask: ULong): List<UserPermission> {
        val result = mutableListOf<UserPermission>()

        for (bit in 0 until UserPermission.entries.size) {
            if (mask and (1uL shl bit) != 0uL) {
                val permission = UserPermission.fromId(bit) ?: error("Unexpected")

                result.add(permission)
            }
        }

        return result
    }


}