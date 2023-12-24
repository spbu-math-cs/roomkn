package org.tod87et.roomkn.server.models.reservations


enum class ReservationSortParameter {
    DATE_FROM,
    DATE_UNTIL,
    OWNER_NAME,
    ROOM_NAME,
    ;

    companion object {
        fun parse(string: String): ReservationSortParameter? = runCatching {
            ReservationSortParameter.valueOf(string.uppercase())
        }.getOrNull()
    }
}
