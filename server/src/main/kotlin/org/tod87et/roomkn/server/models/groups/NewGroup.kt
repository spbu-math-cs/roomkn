package org.tod87et.roomkn.server.models.groups

import kotlinx.serialization.Serializable

@Serializable
data class NewGroup(
    val name: String,
    val users: List<Int>,
)