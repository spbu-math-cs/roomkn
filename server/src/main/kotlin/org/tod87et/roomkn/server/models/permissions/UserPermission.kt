package org.tod87et.roomkn.server.models.permissions

import kotlinx.serialization.Serializable

@Serializable
enum class UserPermission {
    ReservationsCreate,
    ReservationsAdmin,
    RoomsAdmin,
    UsersAdmin,
    GroupsAdmin,
}