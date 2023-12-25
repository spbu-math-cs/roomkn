package org.tod87et.roomkn.server.util

import kotlinx.datetime.Instant
import kotlinx.datetime.toInstant

/**
 * If object is null, return Success(default)
 * If object is not null and toInstant is successful, return Success with result
 * Otherwise return Failure(error)
 */
fun String?.toResultInstantOrNull(): Result<Instant?> {
    return runCatching {
        if (this == null) {
            return@runCatching null
        }
        this.toInstant()
    }
}

fun String?.toResultIntOrDefault(default: Int): Result<Int> {
    return runCatching {
        if (this == null) {
            return@runCatching default
        }
        this.toInt()
    }
}

fun String?.toResultLongOrDefault(default: Long): Result<Long> {
    return runCatching {
        if (this == null) {
            return@runCatching default
        }
        this.toLong()
    }
}