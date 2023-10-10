package org.tod87et.roomkn.server.database

abstract class DatabaseException(message: String) : Exception(message)

class ConnectionException : DatabaseException("Connection exception")

class ReservationException : DatabaseException("Failed to create a reservation")

class MissingElementException : DatabaseException("Missing element")

class ConstraintViolationException(val constraint: Constraint) : DatabaseException("Constraint violation: $constraint") {
    enum class Constraint {
        USER_ID,
        ROOM_ID,
        EMAIL,
        USERNAME,
    }
}

class UnknownException(override val cause: Exception) : DatabaseException("Unknown: ${cause.message}")
