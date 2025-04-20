package com.d4b.sid.controller

import com.d4b.sid.dao.GroupsDao
import com.d4b.sid.model.db.Group
import com.d4b.sid.model.db.Notification
import com.d4b.sid.model.db.User
import com.d4b.sid.repository.NotificationRepository
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/groups")
class GroupController(
    private val groupsDao: GroupsDao,
    private val notificationRepository: NotificationRepository
) {

    // Create a group
    @PostMapping("/create")
    // THIS ENDPOINT WORKS AS EXPECTED
    fun createGroup(@RequestBody request: CreateGroupRequest): Group {
        return groupsDao.createGroup(request.ownerId, request.name)
    }

    // Delete a group
    @DeleteMapping("/{groupId}/delete")
    // THIS ENDPOINT WORKS AS EXPECTED
    fun deleteGroup(@PathVariable groupId: Int, @RequestParam ownerId: String) {
        groupsDao.deleteGroup(ownerId, groupId)
    }

    @PostMapping("/{groupId}/leave")
    fun leaveGroup(
            @PathVariable groupId: Int,
            @RequestParam userId: String
    ): ResponseEntity<String> {
        return try {
            groupsDao.leaveGroup(userId, groupId)
            val group = groupsDao.getGroupById(groupId) // Assuming this DAO method exists
            val groupOwner = group.owner // Get the owner of the group

            val notificationText = "User with ID '$userId' has left your group '${group.name}'."
            val notification = Notification(
                    recipientId = groupOwner.id, // Notify the group owner
                    text = notificationText,
                    isRead = false
            )
            notificationRepository.save(notification) // Save the notification

            ResponseEntity("User left the group successfully", HttpStatus.OK)
        } catch (e: Exception) {
            ResponseEntity(e.message, HttpStatus.FORBIDDEN)
        }
    }

    @GetMapping("/{groupId}/members")
    // THIS ENDPOINT WORKS AS EXPECTED
    fun getGroupMembers(@PathVariable groupId: Int): List<User> {
        return groupsDao.getGroupMembers(groupId)
    }

    @GetMapping("/user/{userId}")
    // THIS ENDPOINT WORKS AS EXPECTED
    fun getUserGroups(@PathVariable userId: String): List<Group> {
        return groupsDao.getUserGroups(userId)
    }

    @GetMapping("/user/{userId}/members")
    // THIS ENDPOINT WORKS AS EXPECTED
    fun getMembersOfUserGroups(@PathVariable userId: String): List<User> {
        return groupsDao.getMembersOfUserGroups(userId)
    }

    @PostMapping("/{groupId}/addUsers")
    // THIS ENDPOINT WORKS AS EXPECTED
    fun addUsersToGroup(
        @PathVariable groupId: Int,
        @RequestParam requestingUserId: String,
        @RequestBody targetUserIds: List<String>
    ) {
        groupsDao.addUsersToGroup(requestingUserId, targetUserIds, groupId)
        val group = groupsDao.getGroupById(groupId) // Assuming this DAO method exists
        val groupName = group.name // Get the owner of the group

        //val group = groupsDao.createGroup(request.name) // Assuming there's a method to fetch group details
        targetUserIds.forEach { userId ->
            val notificationText = "You have been added to the group '${groupName}'."
            val notification = Notification(
                recipientId = userId,
                text = notificationText,
                isRead = false
            )
            notificationRepository.save(notification) // Save the notification in the database
        }

    }


    @DeleteMapping("/{groupId}/removeUsers")
    // THIS ENDPOINT WORKS AS EXPECTED
    fun removeUsersFromGroup(
        @PathVariable groupId: Int,
        @RequestParam requestingUserId: String,
        @RequestParam targetUserIds: List<String>
    ) {
        groupsDao.removeUsersFromGroup(requestingUserId, targetUserIds, groupId)

    }

    data class CreateGroupRequest(
        val ownerId: String,
        val name: String
    )

}