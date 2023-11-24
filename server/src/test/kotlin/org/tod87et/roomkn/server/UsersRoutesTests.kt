package org.tod87et.roomkn.server

import io.ktor.client.call.body
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import org.junit.jupiter.api.Test
import org.tod87et.roomkn.server.models.permissions.UserPermission
import org.tod87et.roomkn.server.models.users.ShortUserInfo
import org.tod87et.roomkn.server.models.users.UpdateUserInfo
import org.tod87et.roomkn.server.models.users.UserInfo

class UsersRoutesTests {
    private val apiPath = "/api/v0"
    private val usersPath = "$apiPath/users"

    private fun userPath(id: Int) = "$usersPath/$id"
    private fun userPermissionsPath(id: Int) = "$usersPath/$id/permissions"

    @Test
    fun getUsers() = KtorTestEnv.testJsonApplication { client ->
        var idRoot: Int?
        with(KtorTestEnv) {
            idRoot = client.createAndAuthAdmin("Root")
        }
        val id1 = KtorTestEnv.createUser("Bob")
        val id2 = KtorTestEnv.createUser("Alice")

        val response = client.get(usersPath)
        assertEquals(HttpStatusCode.OK, response.status, response.bodyAsText())
        val users = response.body<List<ShortUserInfo>>()
        assertEquals(
            setOf(ShortUserInfo(idRoot!!, "Root"), ShortUserInfo(id1, "Bob"), ShortUserInfo(id2, "Alice")),
            users.toSet(),
            "Expect all 3 users: Root, Bob, Alice"
        )
    }

    @Test
    fun getUser() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthAdmin()
        }
        val id = KtorTestEnv.createUser("Bob")

        val user = client.get(userPath(id)).body<UserInfo>()
        assertEquals(UserInfo(id, "Bob", "Bob@example.org"), user)
    }

    @Test
    fun updateUser() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthAdmin()
        }
        val id = KtorTestEnv.createUser("Bob")

        val resp = client.put(userPath(id)) {
            contentType(ContentType.Application.Json)
            setBody(UpdateUserInfo("bob-the-builder", "bob@bob.club"))
        }
        assertEquals(HttpStatusCode.OK, resp.status)

        val user = KtorTestEnv.database.getUser(id).getOrThrow()
        assertEquals(UserInfo(id, "bob-the-builder", "bob@bob.club"), user)
    }

    @Test
    fun updateUserSelf() = KtorTestEnv.testJsonApplication { client ->
        val id = with(KtorTestEnv) {
            client.createAndAuthUser()
        }

        val resp = client.put(userPath(id)) {
            contentType(ContentType.Application.Json)
            setBody(UpdateUserInfo("Eve", "evil@example.org"))
        }
        assertEquals(HttpStatusCode.OK, resp.status)

        val user = KtorTestEnv.database.getUser(id).getOrThrow()
        assertEquals(UserInfo(id, "Eve", "evil@example.org"), user)
    }

    @Test
    fun updateForbidden() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthUser("Eve")
        }
        val id = KtorTestEnv.createUser(name = "Alice", email = "i-know-what-to-do@alice.org")

        val resp = client.put(userPath(id)) {
            contentType(ContentType.Application.Json)
            setBody(UpdateUserInfo("HackedAlice", "evil@example.org"))
        }
        assertEquals(HttpStatusCode.Forbidden, resp.status)

        val user = KtorTestEnv.database.getUser(id).getOrThrow()
        assertEquals(UserInfo(id, "Alice", "i-know-what-to-do@alice.org"), user)
    }

    @Test
    fun deleteUser() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthAdmin()
        }
        val id = KtorTestEnv.createUser("Bob")

        val resp = client.delete(userPath(id))
        assertEquals(HttpStatusCode.OK, resp.status)

        val user = KtorTestEnv.database.getUser(id)
        assertTrue(user.isFailure)
    }

    @Test
    fun deleteForbidden() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthUser("Eve")
        }
        val id = KtorTestEnv.createUser(name = "Alice", email = "i-know-what-to-do@alice.org")

        val resp = client.delete(userPath(id))
        assertEquals(HttpStatusCode.Forbidden, resp.status)

        val user = KtorTestEnv.database.getUser(id).getOrThrow()
        assertEquals(UserInfo(id, "Alice", "i-know-what-to-do@alice.org"), user)
    }

    @Test
    fun getUserPermissions() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthAdmin()
        }
        val id = KtorTestEnv.createUser("Bob")

        val permissions1 = listOf(UserPermission.UsersAdmin, UserPermission.GroupsAdmin)
        KtorTestEnv.database.updateUserPermissions(id, permissions1)
        val permissions2 = client.get(userPermissionsPath(id)).body<List<UserPermission>>()
        assertEquals(permissions1, permissions2)
    }

    @Test
    fun setUserPermissions() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthAdmin()
        }
        val id = KtorTestEnv.createUser("Bob")

        val permissions = listOf(UserPermission.UsersAdmin, UserPermission.GroupsAdmin)
        val resp = client.put(userPermissionsPath(id)) {
            contentType(ContentType.Application.Json)
            setBody(permissions)
        }
        assertEquals(HttpStatusCode.OK, resp.status)
        assertEquals(permissions, KtorTestEnv.database.getUserPermissions(id).getOrThrow())
    }
}
