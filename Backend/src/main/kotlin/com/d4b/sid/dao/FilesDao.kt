package com.d4b.sid.dao

import com.d4b.sid.controller.FilesController
import com.d4b.sid.model.db.*
import com.d4b.sid.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.*

@Service
class FilesDao(
    private val fileRepository: FileRepository,
    private val groupRepository: GroupRepository,
    private val userRepository: UserRepository,
    private val groupFilesRepository: GroupFilesRepository,
    private val fileUserAccessRepository: FileUserAccessRepository,
    private val fileSignaturesRepository: FileSignaturesRepository,
    private val notificationRepository: NotificationRepository
) {

    @Transactional
    fun uploadFile(fileName: String, fileContent: ByteArray, uploadedBy: String): File {
        val base64EncodedContent = Base64.getEncoder().encodeToString(fileContent)
        val newFile = File(
            name = fileName,
            uploadedBy = uploadedBy,
            fileContent = base64EncodedContent,
        )
        return fileRepository.save(newFile)
    }

    @Transactional(readOnly = true)
    fun getFile(fileId: Long, requestingUserId: String): File {
        return fileRepository.findById(fileId).orElseThrow { Exception("File not found") }
    }

    @Transactional
    fun overwriteFileContent(fileId: Long, fileContent: ByteArray): File {
        val existingFile = fileRepository.findById(fileId).orElseThrow { Exception("File not found") }
        val newFile = existingFile.copy(fileContent = Base64.getEncoder().encodeToString(fileContent))
        return fileRepository.save(newFile)
    }

    @Transactional(readOnly = true)
    fun getFileContent(fileId: Long, requestingUserId: String): ByteArray? {
        val file = fileRepository.findById(fileId).orElseThrow { Exception("File not found") }

        // Check if the user is the uploader of the file
        if (file.uploadedBy == requestingUserId) {
            return Base64.getDecoder().decode(file.fileContent)
        }

        // Check if the file is shared with the user
        if (fileUserAccessRepository.existsByFileIdAndUserId(fileId, requestingUserId)) {
            return Base64.getDecoder().decode(file.fileContent)
        }

        // Check if the file belongs to a group the user is part of
        val userGroups = userRepository.findById(requestingUserId)
            .orElseThrow { Exception("User not found") }
            .groups

        if (groupFilesRepository.existsByFileIdAndGroupIdIn(fileId, userGroups.map { it.id })) {
            return Base64.getDecoder().decode(file.fileContent)
        }

        throw Exception("You do not have access to this file")
    }

    @Transactional
    fun uploadFileToGroup(fileName: String, fileContent: ByteArray, uploadedBy: String, groupId: Int): File {
        val group = groupRepository.findById(groupId).orElseThrow { Exception("Group not found") }
        val user = userRepository.findById(uploadedBy).orElseThrow { Exception("User not found") }

        // Check if the user is a member of the group
        if (group.users.none { it.id == uploadedBy }) {
            throw Exception("User is not a member of the group")
        }

        val base64EncodedContent = Base64.getEncoder().encodeToString(fileContent)
        val newFile = File(
            name = fileName,
            uploadedBy = uploadedBy,
            fileContent = base64EncodedContent
        )
        val savedFile = fileRepository.save(newFile)

        // Create group_file association
        val groupFile = GroupFile(
            group = group,
            file = savedFile,
            uploadedBy = uploadedBy
        )
        groupFilesRepository.save(groupFile)

        return savedFile
    }

    @Transactional
    fun addExistingFileToGroup(fileId: Long, groupId: Int, userId: String): GroupFile {
        val group = groupRepository.findById(groupId).orElseThrow { Exception("Group not found") }
        val file = fileRepository.findById(fileId).orElseThrow { Exception("File not found") }

        // Check if the user is a member of the group
        if (group.users.none { it.id == userId }) {
            throw Exception("User is not a member of the group")
        }

        val groupFile = GroupFile(
            group = group,
            file = file,
            uploadedBy = userId
        )
        return groupFilesRepository.save(groupFile)
    }

    @Transactional(readOnly = true)
    fun getFileSharedUsers(fileId: Long): List<Map<String, Any>> {
        val file = fileRepository.findById(fileId).orElseThrow { Exception("File not found") }
        val sharedUsers = fileUserAccessRepository.findByFileId(fileId).map { access ->
            mapOf(
                "userId" to access.user.id,
                "userName" to access.user.name,
                "sharedBy" to access.sharedBy.id,
                "dateShared" to access.dateShared
            )
        }
        return sharedUsers
    }


    fun shareFileWithUser(fileId: Long, targetUserId: String, sharedById: String) {
        val file = fileRepository.findById(fileId).orElseThrow { Exception("File not found") }
        val targetUser = userRepository.findById(targetUserId).orElseThrow { Exception("Target user not found") }
        val sharedBy = userRepository.findById(sharedById).orElseThrow { Exception("User sharing the file not found") }

        println(" -------------------- File: $file")
        println(" -------------------- Target User: $targetUser")
        println(" -------------------- Shared By: $sharedBy")


        if (file.uploadedBy != sharedBy.id) {
            throw Exception("Only the uploader can share this file")
        }

        val existingAccess = fileUserAccessRepository.findByFileIdAndUserId(fileId, targetUserId)
        if (existingAccess != null) {
            throw Exception("User already has access to this file")
        }

        val fileUserAccess = FileUserAccess(
            file = file,
            user = targetUser,
            sharedBy = sharedBy
        )
        fileUserAccessRepository.save(fileUserAccess)
    }

    fun revokeFileAccess(fileId: Long, targetUserId: String, revokingUserId: String) {
        val file = fileRepository.findById(fileId).orElseThrow { Exception("File not found") }
        val access = fileUserAccessRepository.findByFileIdAndUserId(fileId, targetUserId)
            ?: throw Exception("Access record not found")

        if (file.uploadedBy != revokingUserId && access.sharedBy.id != revokingUserId) {
            throw Exception("Only the uploader or the user who shared the file can revoke access")
        }

        fileUserAccessRepository.delete(access)
        notificationRepository.save(
            Notification(
                recipientId = targetUserId,
                text = "Your access to the file '${file.name}' has been revoked.",
                isRead = false
            )
        )
    }

    fun deleteFile(fileId: Long) {
        val file = fileRepository.findById(fileId).orElseThrow { Exception("File not found") }
        fileRepository.delete(file)
    }

    fun getFilesSharedWithUser(userId: String): List<Map<String, Any>> {
        // Fetch files directly shared with the user
        val sharedFiles = fileUserAccessRepository.findByUserId(userId).map { access ->
            mapOf(
                "id" to access.file.id,
                "name" to access.file.name,
                "uploadedBy" to access.file.uploadedBy,
                "sharedBy" to access.sharedBy.id,
                "dateShared" to access.dateShared
            )
        }

        // Fetch files belonging to groups the user is part of, excluding files uploaded by the user
        val userGroups = userRepository.findById(userId)
            .orElseThrow { Exception("User not found") }
            .groups

        val groupFiles = userGroups.flatMap { group ->
            groupFilesRepository.findByGroupId(group.id).mapNotNull { groupFile ->
                if (groupFile.file.uploadedBy != userId) {
                    mapOf(
                        "id" to groupFile.file.id,
                        "name" to groupFile.file.name,
                        "uploadedBy" to groupFile.file.uploadedBy,
                        "groupId" to groupFile.group.id,
                        "groupName" to groupFile.group.name,
                        "dateAdded" to groupFile.dateAdded
                    )
                } else {
                    null
                }
            }
        }

        // Combine results, ensuring no duplicates
        return (sharedFiles + groupFiles).distinctBy { it["id"] }
    }

    fun getFilesForUser(userId: String): List<Map<String, Any>> {
        // Fetch files owned by the user
        return fileRepository.findByUploadedBy(userId).map { file ->
            mapOf(
                "id" to file.id,
                "name" to file.name,
                "uploadedBy" to file.uploadedBy,
                "fileContent" to file.fileContent,
                "dateUploaded" to file.dateUploaded
            )
        }
    }

    @Transactional(readOnly = true)
    fun getFilesForGroup(groupId: Int): List<Map<String, Any>> {
        val groupFiles = groupFilesRepository.findByGroupId(groupId)

        return groupFiles.map { groupFile ->
            mapOf(
                "id" to groupFile.file.id,
                "name" to groupFile.file.name,
                "uploadedBy" to groupFile.file.uploadedBy,
                "fileContent" to groupFile.file.fileContent,
                "dateUploaded" to groupFile.file.dateUploaded
            )
        }
    }

    // FilesDao.kt
    @Transactional
    fun removeFileFromGroup(fileId: Long, groupId: Int, userId: String) {
        val group = groupRepository.findById(groupId).orElseThrow { Exception("Group not found") }
        val file = fileRepository.findById(fileId).orElseThrow { Exception("File not found") }

        // Check if the user is the owner of the group or the owner of the file and a member of the group
        if (group.owner.id != userId && (file.uploadedBy != userId || group.users.none { it.id == userId })) {
            throw Exception("User does not have permission to remove this file from the group")
        }

        val groupFile = groupFilesRepository.findByGroupIdAndFileId(groupId, fileId)
            ?: throw Exception("File is not associated with the group")

        groupFilesRepository.delete(groupFile)
    }

    @Transactional
    fun assignSigners(fileId: Long, signers: List<FilesController.SignerRequest>, assigningUserId: String) {
        val file = fileRepository.findById(fileId).orElseThrow { Exception("File not found") }
        val groupFile = groupFilesRepository.findByFileId(fileId).firstOrNull() ?: throw Exception("Group not found for the file")
        val group = groupFile.group

        // Ensure the assigning user is the owner of the group
        if (group.owner.id != assigningUserId) {
            throw Exception("Only the owner of the group can assign signers.")
        }

        signers.forEach { signer ->
            val user = userRepository.findById(signer.userId).orElseThrow { Exception("User not found") }

            // Check if the signer has access to the file; share it if not
            if (!fileUserAccessRepository.existsByFileIdAndUserId(fileId, signer.userId) && file.uploadedBy != signer.userId) {
                val fileUserAccess = FileUserAccess(
                        file = file,
                        user = user,
                        sharedBy = userRepository.findById(assigningUserId)
                                .orElseThrow { Exception("Assigning user not found") }
                )
                fileUserAccessRepository.save(fileUserAccess)
            }

            // Create or update the signature entry
            val existingSignature = fileSignaturesRepository.findByFileIdAndSignedById(fileId, signer.userId)
            if (existingSignature != null) {
                // Update the existing signature order if provided
                existingSignature.signatureOrder = signer.signatureOrder ?: existingSignature.signatureOrder
                fileSignaturesRepository.save(existingSignature)
            } else {
                // Create a new signature record
                val fileSignature = FileSignature(
                        file = file,
                        signedBy = user,
                        signatureOrder = signer.signatureOrder ?: 0, // Default to 0 if null
                        isSigned = false
                )
                fileSignaturesRepository.save(fileSignature)
            }
        }

        // After all signers are assigned, notify signers of order 0 and order 1 immediately
        val allSignatures = fileSignaturesRepository.findByFileId(fileId)

        // Notify signers of order 0 and 1
        allSignatures
                .filter { it.signatureOrder == 0 || it.signatureOrder == 1 }
                .forEach { signature ->
                    notificationRepository.save(
                            Notification(
                                    recipientId = signature.signedBy.id,
                                    text = "A file named '${file.name}' has been sent to you for signing.",
                                    isRead = false
                            )
                    )
                }
    }

    @Transactional(readOnly = true)
    fun getSignaturesForFile(fileId: Long, requestingUserId: String, groupId: Long): List<FileSignature> {
        val file = fileRepository.findById(fileId).orElseThrow { Exception("File not found") }
        val groupFile = groupFilesRepository.findByGroupIdAndFileId(groupId.toInt(), fileId)
            ?: throw Exception("File is not associated with the specified group")
        val group = groupFile.group

        // Check if the requesting user is the owner of the group
        if (group.owner.id != requestingUserId) {
            throw Exception("User does not have permission to view signatures for this file")
        }

        return fileSignaturesRepository.findByFileId(fileId)
    }

    @Transactional(readOnly = true)
    fun getNextSigner(fileId: Long): String {
        val fileSignatures = fileSignaturesRepository.findByFileId(fileId)

        // First, find the next ordered signer
        val nextOrderedSigner = fileSignatures
            .filter { signature -> signature.signatureOrder != null && !signature.isSigned }
            .minByOrNull { signature -> signature.signatureOrder }

        if (nextOrderedSigner != null) {
            return nextOrderedSigner.signedBy.id
        }

        // If no ordered signer is found, return any unordered signer who hasn't signed
        val nextUnorderedSigner = fileSignatures.firstOrNull { it.signatureOrder == null && !it.isSigned }
            ?: throw Exception("All users have signed the file")

        val nextSignerId = getNextSigner(fileId) // Reuse existing logic to determine next signer

        // Notify the next signer
        notificationRepository.save(
            Notification(
                recipientId = nextSignerId,
                text = "It’s your turn to sign the file.",
                isRead = false
            )
        )

        return nextUnorderedSigner.signedBy.id
    }

    @Transactional
    fun signFile(fileId: Long, userId: String) {
        val file = fileRepository.findById(fileId).orElseThrow { Exception("File not found") }

        // Owner signing logic
        if (file.uploadedBy == userId) {
            val ownerSignature = fileSignaturesRepository.findByFileIdAndSignedById(fileId, userId)
            if (ownerSignature == null) {
                val newOwnerSignature = FileSignature(
                        file = file,
                        signedBy = userRepository.findById(userId).orElseThrow { Exception("User not found") },
                        signatureOrder = 0,
                        isSigned = true,
                        dateSigned = LocalDateTime.now()
                )
                fileSignaturesRepository.save(newOwnerSignature)
                // Owner has order 0
                handlePostSigningNotifications(fileId, 0)
                return
            } else {
                ownerSignature.isSigned = true
                ownerSignature.dateSigned = LocalDateTime.now()
                fileSignaturesRepository.save(ownerSignature)
                // Owner has order 0
                handlePostSigningNotifications(fileId, 0)
                return
            }
        }

        // Non-owner signing logic
        val fileSignature = fileSignaturesRepository.findByFileIdAndSignedById(fileId, userId)
                ?: throw Exception("Signature not found for the given file and user")

        val order = fileSignature.signatureOrder ?: 0

        // Only enforce waiting rule for orders > 1
        if (order > 1) {
            val previousOrderSignatures = fileSignaturesRepository.findByFileId(fileId)
                    .filter { it.signatureOrder == order - 1 }

            if (previousOrderSignatures.isNotEmpty() && previousOrderSignatures.any { !it.isSigned }) {
                throw Exception("Previous order signers have not all signed yet")
            }
        }

        fileSignature.isSigned = true
        fileSignature.dateSigned = LocalDateTime.now()
        fileSignaturesRepository.save(fileSignature)

        // Pass the order of the just-signed user to handlePostSigningNotifications
        handlePostSigningNotifications(fileId, order)
    }


    private fun handlePostSigningNotifications(fileId: Long, justSignedOrder: Int) {
        val file = fileRepository.findById(fileId).orElseThrow { Exception("File not found") }
        val allSignatures = fileSignaturesRepository.findByFileId(fileId)

        // Check if ALL signers have signed
        if (allSignatures.all { it.isSigned }) {
            // Everyone signed, notify owner
            notificationRepository.save(
                    Notification(
                            recipientId = file.uploadedBy,
                            text = "All required signatures have been collected for the file '${file.name}'.",
                            isRead = false
                    )
            )
            return
        }

        // Determine which orders are incomplete
        val unsignedOrders = allSignatures
                .groupBy { it.signatureOrder ?: 0 }
                .filter { (_, sigs) -> sigs.any { !it.isSigned } }
                .keys
                .sorted()

        // We only send "It’s your turn..." if justSignedOrder > 0
        // This ensures no "It’s your turn..." notifications are sent if order 0 just signed.
        if (justSignedOrder > 0) {
            // Exclude order 0 and 1 from turn-based notifications, as they can sign anytime
            val candidateOrders = unsignedOrders.filter { it > 1 }

            if (candidateOrders.isNotEmpty()) {
                val nextOrder = candidateOrders.first()
                // Notify signers at nextOrder who haven't signed yet
                allSignatures
                        .filter { (it.signatureOrder ?: 0) == nextOrder && !it.isSigned }
                        .forEach { signature ->
                            notificationRepository.save(
                                    Notification(
                                            recipientId = signature.signedBy.id,
                                            text = "It’s your turn to sign the file '${file.name}'.",
                                            isRead = false
                                    )
                            )
                        }
            }
        }

        // If justSignedOrder = 0, we do nothing here. No "It’s your turn" notifications are sent.
    }






}
