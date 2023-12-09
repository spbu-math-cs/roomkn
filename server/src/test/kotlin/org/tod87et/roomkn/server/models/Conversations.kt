package org.tod87et.roomkn.server.models

import org.tod87et.roomkn.server.models.reservations.Reservation
import org.tod87et.roomkn.server.models.reservations.ReservationRequest
import org.tod87et.roomkn.server.models.rooms.NewRoomInfo
import org.tod87et.roomkn.server.models.rooms.NewRoomInfoWithNull
import org.tod87et.roomkn.server.models.rooms.RoomInfo
import org.tod87et.roomkn.server.models.rooms.ShortRoomInfo

fun NewRoomInfo.toCreated(id: Int) = RoomInfo(
    id = id,
    name = name,
    description = description
)

fun NewRoomInfoWithNull.toCreated(previousRoomInfo: RoomInfo) = RoomInfo(
    id = previousRoomInfo.id,
    name = this.name ?: previousRoomInfo.name,
    description = this.description ?: previousRoomInfo.description
)

fun RoomInfo.toShort() = ShortRoomInfo(
    id = id,
    name = name
)

fun ReservationRequest.toRegistered(userId: Int, reservationId: Int) =
    Reservation(
        id = reservationId,
        userId = userId,
        roomId = roomId,
        from = from,
        until = until
    )
