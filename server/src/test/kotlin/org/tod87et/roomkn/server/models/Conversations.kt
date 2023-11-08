package org.tod87et.roomkn.server.models

import org.tod87et.roomkn.server.models.rooms.NewRoomInfo
import org.tod87et.roomkn.server.models.rooms.RoomInfo
import org.tod87et.roomkn.server.models.rooms.ShortRoomInfo

fun NewRoomInfo.toCreated(id: Int) = RoomInfo(
    id = id,
    name = name,
    description = description
)

fun RoomInfo.toShort() = ShortRoomInfo(
    id = id,
    name = name
)
