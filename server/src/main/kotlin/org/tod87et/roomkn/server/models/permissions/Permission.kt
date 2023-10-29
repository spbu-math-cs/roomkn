package org.tod87et.roomkn.server.models.permissions

import kotlinx.serialization.Serializable

@Serializable
enum class Permission {
    RoomCreatePermission,
    RoomEditPermission,
    RoomRemovePermission,
    GroupCreatePermission,
    GroupEditPermission,
    GroupRemovePermission,
    ReservationCreatePermission,
    ReservationEditPermission,
    ReservationRemovePermission,
    UserCreatePermission,
    UserEditPermission,
    UserRemovePermission,
    PermissionEditPermission
}