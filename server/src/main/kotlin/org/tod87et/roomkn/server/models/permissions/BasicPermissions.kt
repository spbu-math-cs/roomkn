package org.tod87et.roomkn.server.models.permissions

public val roomsCreatePermission = Permission("rooms.create")
public val roomsEditPermission = Permission("rooms.edit")
public val roomsRemovePermission = Permission("rooms.remove")
public val groupsCreatePermission = Permission("groups.create")
public val groupsEditPermission = Permission("groups.edit")
public val groupsRemovePermission = Permission("groups.remove")
public val reservationCreatePermission = Permission("reservation.create")
public val reservationEditPermission = Permission("reservation.edit")
public val reservationRemovePermission = Permission("reservation.remove")
public val usersCreatePermission = Permission("users.create")
public val usersEditPermission = Permission("users.edit")
public val usersRemovePermission = Permission("users.remove")


public val basicPermissions = listOf(
    roomsCreatePermission,
    roomsEditPermission,
    roomsRemovePermission,
    groupsCreatePermission,
    groupsEditPermission,
    groupsRemovePermission,
    reservationCreatePermission,
    reservationEditPermission,
    reservationRemovePermission,
    usersCreatePermission,
    usersEditPermission,
    usersRemovePermission,
)