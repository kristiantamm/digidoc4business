package com.d4b.sid.dao

import com.d4b.sid.model.db.Group
import com.d4b.sid.model.db.User
import com.d4b.sid.repository.GroupRepository
import com.d4b.sid.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class GroupsDao(
    private val groupRepository: GroupRepository,
    private val userRepository: UserRepository
) {

    fun createGroup(ownerId: String, groupName: String): Group {
        val owner = userRepository.findById(ownerId).orElseThrow { Exception("Owner not found") }

        val group = Group(name = groupName, owner = owner)

        // Add the owner to the group's members
        group.users.add(owner)
        owner.groups.add(group) // Add the group to the owner's list of groups

        groupRepository.save(group)
        userRepository.save(owner) // Save the user to persist the relationship

        return group
    }


    // Delete a group
    fun deleteGroup(ownerId: String, groupId: Int) {
        val group = groupRepository.findById(groupId).orElseThrow { Exception("Group not found") }
        if (group.owner.id != ownerId) {
            throw Exception("You are not the owner of this group")
        }
        groupRepository.delete(group)
    }

    @Transactional
    fun leaveGroup(userId: String, groupId: Int) {
        val group = groupRepository.findById(groupId).orElseThrow { Exception("Group not found") }
        val user = userRepository.findById(userId).orElseThrow { Exception("User not found") }

        // Check if the user is the owner of the group
        if (group.owner.id == userId) {
            throw Exception("Owner cannot leave the group")
        }

        // Check if the user is a member of the group
        if (group.users.none { it.id == userId }) {
            throw Exception("User is not a member of the group")
        }

        // Remove the user from the group's list of users
        group.users.remove(user)
        // Remove the group from the user's list of groups
        user.groups.remove(group)

        // Save both entities to persist changes
        groupRepository.save(group)
        userRepository.save(user)
    }

    // Get all members of a specific group
    fun getGroupMembers(groupId: Int): List<User> {
        val group = groupRepository.findById(groupId).orElseThrow { Exception("Group not found") }
        return group.users
    }

    // Get all groups that a specific user is part of
    fun getUserGroups(userId: String): List<Group> {
        val user = userRepository.findById(userId).orElseThrow { Exception("User not found") }
        return user.groups
    }

    // Get all members of groups that a specific user belongs to, excluding the user with the given userId
    fun getMembersOfUserGroups(userId: String): List<User> {
        val user = userRepository.findById(userId).orElseThrow { Exception("User not found") }
        return user.groups
                .flatMap { it.users }
                .filter { it.id != userId } // Exclude the user with the given userId
                .distinct()
    }
    fun getGroupById(groupId: Int): Group {
        return groupRepository.findById(groupId).orElseThrow { Exception("Group not found") }
    }


    // Add one or multiple users to a group (only the group owner is allowed)
    fun addUsersToGroup(requestingUserId: String, targetUserIds: List<String>, groupId: Int) {
        val requestingUser = userRepository.findById(requestingUserId).orElseThrow { Exception("Requesting user not found") }
        val group = groupRepository.findById(groupId).orElseThrow { Exception("Group not found") }

        // Check if the requesting user is the owner of the group
        if (group.owner.id != requestingUserId) {
            throw Exception("Only the group owner can add members to the group")
        }

        // Add each target user to the group
        targetUserIds.forEach { targetUserId ->
            val targetUser = userRepository.findById(targetUserId).orElseThrow { Exception("Target user not found") }

            // Check if the user is already a member of the group
            if (!group.users.contains(targetUser)) {
                group.users.add(targetUser)
                targetUser.groups.add(group) // Update the user's group list
                userRepository.save(targetUser) // Save the user to persist the relationship
            }
        }

        // Save the updated group
        groupRepository.save(group)
    }



    // Remove one or more users from a group (only the group owner is allowed)
    fun removeUsersFromGroup(requestingUserId: String, targetUserIds: List<String>, groupId: Int) {
        val requestingUser = userRepository.findById(requestingUserId)
                .orElseThrow { Exception("Requesting user not found") }
        val group = groupRepository.findById(groupId)
                .orElseThrow { Exception("Group not found") }

        // Check if the requesting user is the owner of the group
        if (group.owner.id != requestingUserId) {
            throw Exception("Only the group owner can remove members from the group")
        }

        // Iterate through the list of target user IDs and remove them from the group
        targetUserIds.forEach { targetUserId ->
            val targetUser = userRepository.findById(targetUserId)
                    .orElseThrow { Exception("Target user not found: $targetUserId") }

            if (group.users.contains(targetUser)) {
                group.users.remove(targetUser)
                targetUser.groups.remove(group) // Remove the group from the user's list
                userRepository.save(targetUser) // Persist changes to the user's group list
            }
        }

        // Save the updated group after removing users
        groupRepository.save(group)
    }


}
