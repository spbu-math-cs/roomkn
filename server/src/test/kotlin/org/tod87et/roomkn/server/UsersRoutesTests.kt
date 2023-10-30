package org.tod87et.roomkn.server

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.tod87et.roomkn.server.auth.userId
import org.tod87et.roomkn.server.database.DatabaseFactory
import org.tod87et.roomkn.server.models.permissions.UserPermission
import org.tod87et.roomkn.server.models.users.LoginUserInfo
import org.tod87et.roomkn.server.models.users.ShortUserInfo
import org.tod87et.roomkn.server.models.users.UnregisteredUserInfo
import org.tod87et.roomkn.server.models.users.UserInfo
import kotlin.test.assertContains
import kotlin.test.assertEquals

class UsersRoutesTests {
    private val apiPath = "/api/v0"
    private val usersPath = "$apiPath/users"
    private val loginPath = "$apiPath/login"

    private fun userPath(id: Int) = "$usersPath/$id"
    private fun userPermissionsPath(id: Int) = "$usersPath/$id/permissions"


    private val accountManager = KtorTestEnv.accountManager

    @Test
    fun getUsers() = KtorTestEnv.testJsonApplication { client ->
        client.createAndAuthAdmin()
        val id1 = createUser("Bob")
        val id2 = createUser("Alice")

        val users = client.get(usersPath).body<List<ShortUserInfo>>()

        assertContains(users, ShortUserInfo(id1, "Bob"))
        assertContains(users, ShortUserInfo(id2, "Alice"))
    }

    @Test
    fun getUser() = KtorTestEnv.testJsonApplication { client ->
        client.createAndAuthAdmin()
        val id = createUser("Bob")

        val user = client.get(userPath(id)).body<UserInfo>()
        assertEquals(UserInfo(id, "Bob", "Bob@example.org"), user)
    }

    @Test
    fun getUserPermissions() = KtorTestEnv.testJsonApplication { client ->
        client.createAndAuthAdmin()
        val id = createUser("Bob")

        val permissions1 = listOf(UserPermission.UsersAdmin, UserPermission.GroupsAdmin)
        DatabaseFactory.database.updateUserPermissions(id, permissions1)
        val permissions2 = client.get(userPermissionsPath(id)).body<List<UserPermission>>()
        assertEquals(permissions1, permissions2)
    }

    @Test
    fun setUserPermissions() = KtorTestEnv.testJsonApplication { client ->
        client.createAndAuthAdmin()
        val id = createUser("Bob")

        val permissions = listOf(UserPermission.UsersAdmin, UserPermission.GroupsAdmin)
        val resp = client.put(userPermissionsPath(id)) {
            contentType(ContentType.Application.Json)
            setBody(permissions)
        }
        assertEquals(HttpStatusCode.OK, resp.status)
        assertEquals(permissions, DatabaseFactory.database.getUserPermissions(id).getOrThrow())
    }

    private suspend fun HttpClient.createAndAuthAdmin(name: String = "Root", password: String = "the-root-of-evil") {
        val initialSession = accountManager.registerUser(UnregisteredUserInfo(name, "$name@example.org", password))
            .getOrThrow()
        DatabaseFactory.database.updateUserPermissions(
            initialSession.userId,
            listOf(UserPermission.UsersAdmin)
        ).getOrThrow()

        val auth = post(loginPath) {
            contentType(ContentType.Application.Json)
            setBody(LoginUserInfo(name, password))
        }
        assertEquals(HttpStatusCode.OK, auth.status)
    }

    private fun createUser(name: String, password: String = "qwerty"): Int {
        val initialSession = accountManager.registerUser(UnregisteredUserInfo(name, "$name@example.org", password))
            .getOrThrow()
        DatabaseFactory.database.updateUserPermissions(
            initialSession.userId,
            listOf(UserPermission.UsersAdmin)
        ).getOrThrow()

        return initialSession.userId
    }

    @AfterEach
    fun clearTestDatabase() {
        DatabaseFactory.database.clear()
    }

    companion object {
        @JvmStatic
        @BeforeAll
        fun connectToTestDatabase() {
            DatabaseFactory.initEmbedded()
        }
    }
}