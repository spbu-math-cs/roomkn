package org.tod87et.roomkn.server.database

import kotlinx.datetime.Instant
import org.jetbrains.exposed.sql.SortOrder
import org.tod87et.roomkn.server.models.permissions.UserPermission
import org.tod87et.roomkn.server.models.reservations.Reservation
import org.tod87et.roomkn.server.models.reservations.ReservationSortParameter
import org.tod87et.roomkn.server.models.reservations.UnregisteredReservation
import org.tod87et.roomkn.server.models.rooms.NewRoomInfo
import org.tod87et.roomkn.server.models.rooms.NewRoomInfoWithNull
import org.tod87et.roomkn.server.models.rooms.RoomInfo
import org.tod87et.roomkn.server.models.rooms.ShortRoomInfo
import org.tod87et.roomkn.server.models.users.FullUserInfo
import org.tod87et.roomkn.server.models.users.Invite
import org.tod87et.roomkn.server.models.users.ShortUserInfo
import org.tod87et.roomkn.server.models.users.InviteRequest
import org.tod87et.roomkn.server.models.users.SaltedInvite
import org.tod87et.roomkn.server.models.users.SaltedInviteRequest
import org.tod87et.roomkn.server.models.users.UpdateUserInfo
import org.tod87et.roomkn.server.models.users.UpdateUserInfoWithNull
import org.tod87et.roomkn.server.models.users.UserInfo

interface Database {
    fun getRooms(limit: Int = Int.MAX_VALUE, offset: Long = 0L): Result<List<ShortRoomInfo>>
    fun getRoomsSize(): Result<Long>
    fun getRoomsShort(ids: List<Int>): Result<List<ShortRoomInfo>>
    fun getRoom(roomId: Int): Result<RoomInfo>
    fun createRoom(roomInfo: NewRoomInfo): Result<RoomInfo>
    fun updateRoom(roomId: Int, roomInfo: NewRoomInfo): Result<Unit>
    fun updateRoomPartially(roomId: Int, roomInfo: NewRoomInfoWithNull): Result<Unit>
    fun deleteRoom(roomId: Int): Result<Unit>
    fun getMap(): Result<String>
    fun updateMap(newMap: String): Result<Unit>
    fun createDefaultMap(): Result<Unit>
    fun getRoomReservations(
        roomId: Int,
        from: Instant? = null,
        until: Instant? = null,
        limit: Int = Int.MAX_VALUE,
        offset: Long = 0L
    ): Result<List<Reservation>>

    fun getUserReservations(
        userId: Int,
        from: Instant? = null,
        until: Instant? = null,
        limit: Int = Int.MAX_VALUE,
        offset: Long = 0L,
    ): Result<List<Reservation>>

    @Suppress("LongParameterList")
    fun getReservations(
        usersIds: List<Int>,
        roomsIds: List<Int>,
        from: Instant? = null,
        until: Instant? = null,
        limit: Int = Int.MAX_VALUE,
        offset: Long = 0L,
        sortParameter: ReservationSortParameter? = null,
        sortOrder: SortOrder? = null,
    ): Result<List<Reservation>>

    fun getReservationsSize(
        usersIds: List<Int>,
        roomsIds: List<Int>,
        from: Instant? = null,
        until: Instant? = null,
    ): Result<Long>

    fun getReservation(reservationId: Int): Result<Reservation>
    fun updateReservation(reservationId: Int, from: Instant, until: Instant): Result<Unit>
    fun deleteReservation(reservationId: Int): Result<Unit>
    fun createReservation(reservation: UnregisteredReservation): Result<Reservation>
    fun getUsers(limit: Int = Int.MAX_VALUE, offset: Long = 0L): Result<List<ShortUserInfo>>
    fun getUsersSize(): Result<Long>
    fun getFullUsers(limit: Int = Int.MAX_VALUE, offset: Long = 0L): Result<List<FullUserInfo>>
    fun getUser(userId: Int): Result<UserInfo>
    fun updateUserInfo(userId: Int, info: UpdateUserInfo): Result<Unit>
    fun updateUserInfoPartially(userId: Int, info: UpdateUserInfoWithNull): Result<Unit>
    fun deleteUser(userId: Int): Result<Unit>
    fun getUserPermissions(userId: Int): Result<List<UserPermission>>
    fun updateUserPermissions(userId: Int, permissions: List<UserPermission>): Result<Unit>
    fun createInvite(tokenHash: ByteArray, inviteRequest: SaltedInviteRequest): Result<Unit>
    fun validateInvite(tokenHash: ByteArray): Result<Unit>
    fun updateInvite(tokenHash: ByteArray): Result<Unit>
    fun getInvites(limit: Int = Int.MAX_VALUE, offset: Long = 0L): Result<List<Invite>>
    fun getInvite(inviteId: Int): Result<SaltedInvite>
    fun deleteInvite(inviteId: Int): Result<Unit>

    /**
     * Clear database for TEST/DEBUG purpose
     */
    fun clear(): Result<Unit>

    fun createMultipleReservations(reservations: List<UnregisteredReservation>): List<Result<Reservation>> =
        reservations.map { createReservation(it) }
}
