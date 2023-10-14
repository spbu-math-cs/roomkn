package org.tod87et.roomkn.server.auth

abstract class AuthException(message: String? = null, cause: Throwable? = null) : Exception(message, cause)

class NoSuchUserException(
    username: String,
    cause: Throwable? = null,
) : AuthException(
    message = "User with username `$username` is not found",
    cause = cause
)

class AuthFailedException(
    message: String? = null,
    cause: Throwable? = null,
) : AuthException(
    message = message,
    cause = cause
)

class RegistrationFailedException(
    message: String? = null,
    cause: Throwable? = null,
) : AuthException(
    message = message,
    cause = cause
)
