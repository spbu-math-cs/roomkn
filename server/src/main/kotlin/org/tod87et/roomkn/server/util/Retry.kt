package org.tod87et.roomkn.server.util

import kotlin.time.Duration

private const val INTERVAL_MULTIPLIER = 2

/**
 * Retries to execute [action] maximum [retries] times.
 * Calls [onErrorAction] after each unsuccessful attempt except the last one.
 * Throws the last caught exception if all attempts have failed.
 */
internal inline fun <R> retryAction(
    retries: Int,
    startInterval: Duration,
    onErrorAction: (retry: Int, ex: Throwable) -> Unit,
    action: () -> R
): R {
    var interval = startInterval
    for (idx in 0 until retries) {
        val ex = runCatching(action).onSuccess { return it }.exceptionOrNull()!!
        onErrorAction(idx, ex)

        if (idx == retries - 1) {
            throw ex
        }

        Thread.sleep(interval.inWholeMilliseconds)
        interval *= INTERVAL_MULTIPLIER
    }

    throw AssertionError("unreachable code")
}
