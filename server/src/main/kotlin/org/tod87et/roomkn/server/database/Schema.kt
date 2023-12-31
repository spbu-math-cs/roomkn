package org.tod87et.roomkn.server.database

import kotlinx.datetime.Instant
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.kotlin.datetime.timestamp
import org.tod87et.roomkn.server.database.Reservations.autoIncrement

object Users : Table() {
    val id: Column<Int> = integer("id").autoIncrement()
    val username: Column<String> = text("username").uniqueIndex("unique_users_username")
    val email: Column<String> = text("email").uniqueIndex("unique_users_email")
    val salt: Column<ByteArray> = binary("salt", 32)
    val passwordHash: Column<ByteArray> = binary("passwordHash", 32)
    val permissions: Column<ULong> = ulong("permissions")

    override val primaryKey = PrimaryKey(id)
}

object Rooms : Table() {
    val id: Column<Int> = integer("id").autoIncrement()
    val name: Column<String> = text("name")
    val description: Column<String> = text("description")

    override val primaryKey = PrimaryKey(id)
}

object Reservations : Table() {
    val id: Column<Int> = integer("id").autoIncrement()
    val userId: Column<Int> = integer("userId")
        .references(Users.id, fkName = "fk_reservations_userid", onDelete = ReferenceOption.CASCADE)
    val roomId: Column<Int> = integer("roomId")
        .references(Rooms.id, fkName = "fk_reservations_roomid", onDelete = ReferenceOption.CASCADE)

    val from: Column<Instant> = timestamp("from")
    val until: Column<Instant> = timestamp("until")

    override val primaryKey = PrimaryKey(id)
}

object ActiveTokens : Table() {
    val tokenHash: Column<ByteArray> = binary("tokenHash", 32)
    val expirationDate: Column<Instant> = timestamp("expirationDate")

    override val primaryKey = PrimaryKey(tokenHash, name = "pk_tokens_tokenhash")
}

object InviteTokens: Table() {
    val inviteTokenHash: Column<ByteArray> = binary("inviteTokenHash", 32)
    val id: Column<Int> = integer("id").autoIncrement()
    val expirationDate: Column<Instant> = timestamp("expirationDate")
    val remaining: Column<Int> = integer("remaining")
    val salt: Column<ByteArray> = binary("salt", 32) //DEFAULT_SALT_SIZE
    val size: Column<Int> = integer("size")
    override val primaryKey = PrimaryKey(Map.id)
}

object Map : Table() {
    val id: Column<Int> = integer("id").autoIncrement()
    val json: Column<String> = text("json")
    override val primaryKey = PrimaryKey(id)
}