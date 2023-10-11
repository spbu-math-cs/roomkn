package org.tod87et.roomkn.server.database

abstract class DatabaseException(message: String, cause: Throwable? = null) : Exception(message, cause)

class ConnectionException(cause: Throwable) : DatabaseException("Connection exception", cause)

class ReservationException : DatabaseException("Failed to create a reservation")

class MissingElementException : DatabaseException("Missing element")

class ConstraintViolationException(
    val constraint: Constraint,
    cause: Throwable,
) : DatabaseException("Constraint violation: $constraint", cause) {
    enum class Constraint {
        USER_ID,
        ROOM_ID,
        EMAIL,
        USERNAME,
    }
}

class UnknownException(cause: Throwable) : DatabaseException("Unknown: ${cause.message}", cause)
