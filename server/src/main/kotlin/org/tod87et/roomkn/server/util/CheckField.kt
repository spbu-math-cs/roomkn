package org.tod87et.roomkn.server.util

internal fun <T : Any> checkField(field: T?, fieldName: String): T {
    if (field == null) {
        throw IllegalStateException("$fieldName is not set")
    } else {
        return field
    }
}