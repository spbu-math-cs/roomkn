package org.tod87et.roomkn.server.database

import org.tod87et.roomkn.server.models.rooms.NewRoomInfo
import org.tod87et.roomkn.server.models.reservations.Reservation
import org.tod87et.roomkn.server.models.rooms.RoomInfo
import org.tod87et.roomkn.server.models.rooms.ShortRoomInfo
import org.tod87et.roomkn.server.models.users.ShortUserInfo
import org.tod87et.roomkn.server.models.reservations.UnregisteredReservation
import org.tod87et.roomkn.server.models.users.UserInfo

interface Database {
    fun getRooms(): Result<List<ShortRoomInfo>>
    fun getRoom(roomId: Int): Result<RoomInfo>
    fun createRoom(roomInfo: NewRoomInfo): Result<RoomInfo>
    fun getRoomReservations(roomId: Int): Result<List<Reservation>>
    fun createReservation(reserve: UnregisteredReservation): Result<Reservation>
    fun getUsers(): Result<List<ShortUserInfo>>
    fun getUser(userId: Int): Result<UserInfo>


    /**
     * Clear database for TEST/DEBUG purpose
     */
    fun clear(): Result<Unit>
}