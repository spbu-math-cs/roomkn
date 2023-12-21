package org.tod87et.roomkn.server

import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpStatusCode
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class MetricsTest {
    private val metricsPath = "/metrics"

    @Test
    fun testMetrics() = KtorTestEnv.testJsonApplication { client ->
        val resp = client.get(metricsPath)
        assertEquals(HttpStatusCode.OK, resp.status)
        assertTrue(resp.bodyAsText().isNotEmpty())
    }
}