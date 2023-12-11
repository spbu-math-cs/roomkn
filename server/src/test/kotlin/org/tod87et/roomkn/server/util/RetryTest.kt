package org.tod87et.roomkn.server.util

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFails
import kotlin.test.assertTrue
import kotlin.test.fail
import kotlin.time.Duration.Companion.milliseconds

class RetryTest {

    @Test
    fun retrySuccess1() {
        var ok = false
        retryAction(2, 1.milliseconds, onErrorAction = { _, _ -> fail() }) {
            ok = true
        }

        assertTrue(ok)
    }

    @Test
    fun retrySuccess2() {
        var cnt = 0
        retryAction(2, 1.milliseconds, onErrorAction = { _, _ -> }) {
            cnt += 1
            if (cnt < 2) {
                fail()
            }
        }

        assertEquals(2, cnt)
    }

    @Test
    fun retryFail() {
        assertFails {
            retryAction(2, 1.milliseconds, onErrorAction = { _, _ -> }) {
                fail()
            }
        }
    }
}