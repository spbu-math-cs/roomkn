package org.tod87et.roomkn.server.database

import kotlinx.datetime.Instant
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.kotlin.datetime.timestamp

object Users : Table() {
    val id: Column<Int> = integer("id").autoIncrement()
    val username: Column<String> = text("username")
    val email: Column<String> = text("email")
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
    val userId: Column<Int> = integer("userId").references(Users.id)
    val roomId: Column<Int> = integer("roomId").references(Rooms.id)

    val from: Column<Instant> = timestamp("from")
    val until: Column<Instant> = timestamp("until")

    override val primaryKey = PrimaryKey(id)
}