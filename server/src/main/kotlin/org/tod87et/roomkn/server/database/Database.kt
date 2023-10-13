package org.tod87et.roomkn.server.database

import org.tod87et.roomkn.server.models.Reservation
import org.tod87et.roomkn.server.models.RoomInfo
import org.tod87et.roomkn.server.models.ShortRoomInfo
import org.tod87et.roomkn.server.models.ShortUserInfo
import org.tod87et.roomkn.server.models.UnregisteredReservation
import org.tod87et.roomkn.server.models.UserInfo

interface Database {
    fun getRooms(): Result<List<ShortRoomInfo>>
    fun getRoom(roomId: Int): Result<RoomInfo>
    fun getRoomReservations(roomId: Int): Result<List<Reservation>>
    fun createReservation(reserve: UnregisteredReservation): Result<Reservation>
    fun getUsers(): Result<List<ShortUserInfo>>
    fun getUser(userId: Int): Result<UserInfo>

    /**
     * Clear database for TEST/DEBUG purpose
     */
    fun clear(): Unit
}