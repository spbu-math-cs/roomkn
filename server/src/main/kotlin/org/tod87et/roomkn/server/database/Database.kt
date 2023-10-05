package org.tod87et.roomkn.server.database

import org.tod87et.roomkn.server.models.*
import javax.sql.DataSource

interface Database {
    fun getRooms(): Result<List<ShortRoomInfo>>
    fun getRoom(roomId: Int): Result<RoomInfo>
    fun getRoomReservations(roomId: Int): Result<List<Reservation>>
    fun createReservation(reserve: UnregisteredReservation): Result<Reservation>
    fun getUsers(): Result<List<ShortUserInfo>>
    fun getUser(userId: Int): Result<UserInfo>
    fun registerUser(user: UnregisteredUserInfo): Result<UserInfo>
    fun loginUser(user: LoginUserInfo): Result<UserInfo>

    /**
     * Clear database for TEST/DEBUG purpose
     */
    fun clear(): Unit
}