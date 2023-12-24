package org.tod87et.roomkn.server

import io.ktor.client.call.body
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.parameter
import io.ktor.client.request.patch
import io.ktor.client.request.post
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import kotlin.time.Duration.Companion.days
import kotlin.time.Duration.Companion.hours
import kotlinx.datetime.Clock
import org.junit.jupiter.api.Test
import org.tod87et.roomkn.server.KtorTestEnv.logout
import org.tod87et.roomkn.server.models.permissions.UserPermission
import org.tod87et.roomkn.server.models.users.FullUserInfo
import org.tod87et.roomkn.server.models.users.Invite
import org.tod87et.roomkn.server.models.users.InviteRequest
import org.tod87et.roomkn.server.models.users.LoginUserInfo
import org.tod87et.roomkn.server.models.users.PasswordUpdateInfo
import org.tod87et.roomkn.server.models.users.ShortUserInfo
import org.tod87et.roomkn.server.models.users.UnregisteredUserInfo
import org.tod87et.roomkn.server.models.users.UpdateUserInfo
import org.tod87et.roomkn.server.models.users.UpdateUserInfoWithNull
import org.tod87et.roomkn.server.models.users.UserInfo

class UsersRoutesTests {
    private val apiPath = "/api/v0"
    private val usersPath = "$apiPath/users"

    private fun userPath(id: Int) = "$usersPath/$id"
    private fun userPermissionsPath(id: Int) = "$usersPath/$id/permissions"
    private fun userPasswordPath(id: Int) = "$usersPath/$id/password"
    private val createInvite = "$usersPath/invite"
    private val invitationsPath = "$usersPath/invitations"
    private fun invitationPath(id: Int) = "$usersPath/invitations/$id"
    private fun checkInviteTokenPath(token: String) = "$apiPath/invite/validate-token/$token"
    private fun registerTokenPath(token: String) = "$apiPath/register/$token"

    @Test
    fun getUsers() = KtorTestEnv.testJsonApplication { client ->
        var idRoot: Int
        with(KtorTestEnv) {
            idRoot = client.createAndAuthAdmin("Root")
        }
        val id1 = KtorTestEnv.createUser("Bob")
        val id2 = KtorTestEnv.createUser("Alice")

        val response = client.get(usersPath)
        assertEquals(HttpStatusCode.OK, response.status, "Message: ${response.bodyAsText()}\n")
        val users = response.body<List<ShortUserInfo>>()
        assertEquals(
            setOf(
                ShortUserInfo(idRoot, "Root", "Root@example.org"),
                ShortUserInfo(id1, "Bob", "Bob@example.org"),
                ShortUserInfo(id2, "Alice", "Alice@example.org")
            ),
            users.toSet(),
            "Expect all 3 users: Root, Bob, Alice"
        )
    }

    @Test
    fun getUsersFull() = KtorTestEnv.testJsonApplication { client ->
        var idRoot: Int
        with(KtorTestEnv) {
            idRoot = client.createAndAuthAdmin("Root")
        }
        val id1 = KtorTestEnv.createUser("Bob")
        val id2 = KtorTestEnv.createUser("Alice")

        val response = client.get(usersPath) { parameter("includePermissions", true) }
        assertEquals(HttpStatusCode.OK, response.status, "Message: ${response.bodyAsText()}\n")
        val users = response.body<List<FullUserInfo>>()
        assertEquals(
            setOf(
                FullUserInfo(idRoot, "Root", "Root@example.org", UserPermission.entries.toSet()),
                FullUserInfo(id1, "Bob", "Bob@example.org", setOf(UserPermission.ReservationsCreate)),
                FullUserInfo(id2, "Alice", "Alice@example.org", setOf(UserPermission.ReservationsCreate))
            ),
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
    fun updateUserPassword() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthAdmin()
        }
        val id = KtorTestEnv.createUser("Bob", password = "123")

        val resp = client.put(userPasswordPath(id)) {
            contentType(ContentType.Application.Json)
            setBody(PasswordUpdateInfo("123", "ytrewq"))
        }
        assertEquals(HttpStatusCode.OK, resp.status)

        val auth = client.post(KtorTestEnv.LOGIN_PATH) {
            contentType(ContentType.Application.Json)
            setBody(LoginUserInfo("Bob", "ytrewq"))
        }
        assertEquals(HttpStatusCode.OK, auth.status)
    }

    @Test
    fun updateUserPartially() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthAdmin()
        }
        val id = KtorTestEnv.createUser("Bob")

        val resp = client.patch(userPath(id)) {
            contentType(ContentType.Application.Json)
            setBody(UpdateUserInfoWithNull(email = "bob@bob.club"))
        }
        assertEquals(HttpStatusCode.OK, resp.status)

        val user = KtorTestEnv.database.getUser(id).getOrThrow()
        assertEquals(UserInfo(id, "Bob", "bob@bob.club"), user)
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
        val response = client.get(userPermissionsPath(id))
        assertEquals(HttpStatusCode.OK, response.status, "Message: ${response.bodyAsText()}")
        val permissions2 = response.body<List<UserPermission>>()
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
        assertEquals(HttpStatusCode.OK, resp.status, "Message: ${resp.bodyAsText()}")
        assertEquals(permissions, KtorTestEnv.database.getUserPermissions(id).getOrThrow())
    }

    @Test
    fun getInvitations() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthAdmin()
        }
        val timestamp = Clock.System.now()
        val invitations = listOf(InviteRequest(2, timestamp + 1.days), InviteRequest(100, timestamp + 30.days))
        var response = client.post(createInvite) {
            contentType(ContentType.Application.Json)
            setBody(invitations[0])
        }
        response = client.post(createInvite) {
            contentType(ContentType.Application.Json)
            setBody(invitations[1])
        }
        response = client.get(invitationsPath)
        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals(invitations.toSet(), response.body<List<Invite>>().map { it.toInviteRequest() }.toSet())
    }

    @Test
    fun deleteInvitations() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthAdmin()
        }
        val timestamp = Clock.System.now()
        val invitation = InviteRequest(5, timestamp + 1.hours)
        var response = client.post(createInvite) {
            contentType(ContentType.Application.Json)
            setBody(invitation)
        }
        val id = client.get(invitationsPath).body<List<Invite>>()[0].id
        response = client.delete(invitationPath(id))
        assertEquals(HttpStatusCode.OK, response.status)
        val list = client.get(invitationsPath).body<List<Invite>>()
        assertTrue { list.isEmpty() }
    }

    @Test
    fun getInviteToken() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthAdmin()
        }
        val timestamp = Clock.System.now()
        val invitation = InviteRequest(5, timestamp + 1.hours)
        var response = client.post(createInvite) {
            contentType(ContentType.Application.Json)
            setBody(invitation)
        }
        val token = response.bodyAsText()
        val id = client.get(invitationsPath).body<List<Invite>>()[0].id
        response = client.get(invitationPath(id))
        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals(token, response.bodyAsText())
    }

    @Test
    fun checkInviteValidation() = KtorTestEnv.testJsonApplication { client ->
        with(KtorTestEnv) {
            client.createAndAuthAdmin()
        }
        val timestamp = Clock.System.now()
        val invitation = InviteRequest(1, timestamp + 1.hours)
        var response = client.post(createInvite) {
            contentType(ContentType.Application.Json)
            setBody(invitation)
        }
        val token = response.bodyAsText()
        response = client.get(checkInviteTokenPath(token))
        assertEquals(HttpStatusCode.OK, response.status)
        client.logout()
        val newUser = UnregisteredUserInfo("Invited", "new_user@best.mail.com", "1234")
        response = client.post(registerTokenPath(token)) {
            contentType(ContentType.Application.Json)
            setBody(newUser)
        }
        response = client.get(checkInviteTokenPath(token))
        assertEquals(HttpStatusCode.BadRequest, response.status)
    }
}
