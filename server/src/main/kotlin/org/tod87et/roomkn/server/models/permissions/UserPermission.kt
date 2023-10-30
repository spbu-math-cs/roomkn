package org.tod87et.roomkn.server.models.permissions

import kotlinx.serialization.Serializable

@Serializable
enum class UserPermission(val id: Int) {
    ReservationsCreate(0),
    ReservationsAdmin(1),
    RoomsAdmin(2),
    UsersAdmin(3),
    GroupsAdmin(4);

    companion object {
        init {
            val enumSize = entries.size

            require(entries.all { it.id in 0 until enumSize })
            require(entries.distinct().size == enumSize)
        }

        fun fromId(value: Int) = entries.firstOrNull { it.id == value }
    }
}