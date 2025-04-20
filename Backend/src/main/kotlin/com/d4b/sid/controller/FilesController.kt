package com.d4b.sid.controller

import com.d4b.sid.dao.FilesDao
import com.d4b.sid.model.db.Notification
import com.d4b.sid.repository.NotificationRepository
import com.d4b.sid.services.FilesService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Path
import java.util.*

@RestController
@RequestMapping("/files")
class FilesController(
    private val filesDao: FilesDao,
    private val notificationRepository: NotificationRepository,
    private val filesService: FilesService
) {

    @DeleteMapping
    fun deleteFile(@RequestParam fileId: Long): ResponseEntity<Any> {
        return try {
            filesDao.deleteFile(fileId)
            ResponseEntity("File deleted successfully", HttpStatus.OK)
        } catch (e: Exception) {
            ResponseEntity(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    private fun mapFileToBase64(filePath: Path): Map<String, String> {
        val fileName = filePath.fileName.toString()
        val fileContent = Files.readAllBytes(filePath)
        val base64Content = Base64.getEncoder().encodeToString(fileContent)

        return mapOf(
            "fileName" to fileName,
            "base64Content" to base64Content
        )
    }

    @PostMapping("/uploadFile")
    fun uploadFile(
        @RequestParam("file") file: MultipartFile,
        @RequestParam("uploadedBy") uploadedBy: String
    ): ResponseEntity<Any> {
        return try {
            val savedFile = filesDao.uploadFile(
                fileName = file.originalFilename ?: "unknown",
                fileContent = file.bytes,
                uploadedBy = uploadedBy
            )
            val response = mapOf(
                "id" to savedFile.id,
                "name" to savedFile.name,
                "uploadedBy" to savedFile.uploadedBy
            )
            ResponseEntity(response, HttpStatus.OK)
        } catch (e: Exception) {
            ResponseEntity(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @GetMapping("/{fileId}/content")
    fun getFileContent(
        @PathVariable fileId: Long,
        @RequestParam("requestingUserId") requestingUserId: String
    ): ResponseEntity<Any> {
        return try {
            val content = filesDao.getFileContent(fileId, requestingUserId)
                ?: return ResponseEntity("File content not found", HttpStatus.NOT_FOUND)
            ResponseEntity(content, HttpStatus.OK)
        } catch (e: Exception) {
            ResponseEntity(e.message, HttpStatus.FORBIDDEN)
        }
    }

    @PostMapping("/uploadToGroup")
    fun uploadFileToGroup(
        @RequestParam("file") file: MultipartFile,
        @RequestParam("uploadedBy") uploadedBy: String,
        @RequestParam("groupId") groupId: Int
    ): ResponseEntity<Any> {
        return try {
            val savedFile = filesDao.uploadFileToGroup(
                fileName = file.originalFilename ?: "unknown",
                fileContent = file.bytes,
                uploadedBy = uploadedBy,
                groupId = groupId
            )
            val response = mapOf(
                "id" to savedFile.id,
                "name" to savedFile.name,
                "uploadedBy" to savedFile.uploadedBy
            )
            ResponseEntity(response, HttpStatus.OK)
        } catch (e: Exception) {
            ResponseEntity(e.message, HttpStatus.FORBIDDEN)
        }
    }

    @PostMapping("/addToGroup")
    fun addFilesToGroup(
            @RequestParam("fileIds") fileIds: List<Long>,
            @RequestParam("groupId") groupId: Int,
            @RequestParam("userId") userId: String
    ): ResponseEntity<Any> {
        return try {
            fileIds.forEach { fileId ->
                filesDao.addExistingFileToGroup(fileId, groupId, userId)
            }
            ResponseEntity("Files added to group successfully", HttpStatus.OK)
        } catch (e: Exception) {
            ResponseEntity(e.message, HttpStatus.FORBIDDEN)
        }
    }

    // FilesController.kt
    @DeleteMapping("/{fileId}/removeFromGroup")
    fun removeFileFromGroup(
            @PathVariable fileId: Long,
            @RequestParam groupId: Int,
            @RequestParam userId: String
    ): ResponseEntity<Any> {
        return try {
            filesDao.removeFileFromGroup(fileId, groupId, userId)
            ResponseEntity("File removed from group successfully", HttpStatus.OK)
        } catch (e: Exception) {
            ResponseEntity(e.message, HttpStatus.FORBIDDEN)
        }
    }

    @GetMapping("/{fileId}/sharedUsers")
    fun getFileSharedUsers(@PathVariable fileId: Long): ResponseEntity<Any> {
        return try {
            val sharedUsers = filesDao.getFileSharedUsers(fileId)
            ResponseEntity(sharedUsers, HttpStatus.OK)
        } catch (e: Exception) {
            ResponseEntity(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @PostMapping("/{fileId}/share")
    fun shareFileWithUser(
        @PathVariable fileId: Long,
        @RequestParam targetUserIds: List<String>,
        @RequestParam sharedById: String
    ): ResponseEntity<Any> {
        return try {
            targetUserIds.forEach { targetUserId ->
                filesDao.shareFileWithUser(fileId, targetUserId, sharedById)

                // Send a notification
                val file = filesDao.getFile(fileId, sharedById) // Fetch file details
                notificationRepository.save(
                    Notification(
                        recipientId = targetUserId,
                        text = "A file named '${file.name}' has been shared with you by user ID '$sharedById'.",
                        isRead = false
                    )
                )

            }

            ResponseEntity("File shared successfully", HttpStatus.OK)
        } catch (e: Exception) {
            ResponseEntity(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @DeleteMapping("/{fileId}/revoke")
    fun revokeFileAccess(
        @PathVariable fileId: Long,
        @RequestParam targetUserId: String,
        @RequestParam revokingUserId: String
    ): ResponseEntity<Any> {
        return try {
            filesDao.revokeFileAccess(fileId, targetUserId, revokingUserId)
            ResponseEntity("Access revoked successfully", HttpStatus.OK)
        } catch (e: Exception) {
            ResponseEntity(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @GetMapping("/sharedWithUser")
    fun getSharedWithUser(@RequestParam("userId") userId: String): ResponseEntity<Any> {
        return try {
            val files = filesDao.getFilesSharedWithUser(userId)
            ResponseEntity(files, HttpStatus.OK)
        } catch (e: Exception) {
            ResponseEntity(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @GetMapping("/filesForUser")
    fun getFilesForUser(@RequestParam("userId") userId: String): ResponseEntity<Any> {
        return try {
            val files = filesDao.getFilesForUser(userId)
            ResponseEntity(files, HttpStatus.OK)
        } catch (e: Exception) {
            ResponseEntity(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @GetMapping("/group/{groupId}")
    fun getFilesForGroup(@PathVariable groupId: Int): ResponseEntity<Any> {
        return try {
            val files = filesDao.getFilesForGroup(groupId)
            ResponseEntity(files, HttpStatus.OK)
        } catch (e: Exception) {
            ResponseEntity(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @PostMapping("/file/{fileId}/group/{groupId}/assignSigners")
    fun assignSigners(
            @PathVariable fileId: Long,
            @PathVariable groupId: Int,
            @RequestBody request: AssignSignersRequest
    ): ResponseEntity<Any> {
        return try {
            val containerId = filesService.createContainer(fileId, request.assigningUserId, groupId).id
            filesDao.assignSigners(containerId, request.signers, request.assigningUserId)
            ResponseEntity("Signers assigned successfully", HttpStatus.OK)
        } catch (e: Exception) {
            ResponseEntity(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @GetMapping("/{fileId}/signatures")
    fun getSignaturesForFile(
            @PathVariable fileId: Long,
            @RequestParam("requestingUserId") requestingUserId: String,
            @RequestParam("groupId") groupId: Long
    ): ResponseEntity<Any> {
        return try {
            val signatures = filesDao.getSignaturesForFile(fileId, requestingUserId, groupId)
            ResponseEntity(signatures, HttpStatus.OK)
        } catch (e: Exception) {
            ResponseEntity(e.message, HttpStatus.FORBIDDEN)
        }
    }

    @GetMapping("/{fileId}/nextSigner")
    fun getNextSigner(
        @PathVariable fileId: Long
    ): ResponseEntity<Any> {
        return try {
            val nextSigner = filesDao.getNextSigner(fileId)
            ResponseEntity(mapOf("nextSigner" to nextSigner), HttpStatus.OK)
        } catch (e: Exception) {
            ResponseEntity(e.message, HttpStatus.NOT_FOUND)
        }
    }

    @PostMapping("/{fileId}/sign")
    fun signFile(
        @PathVariable fileId: Long,
        @RequestParam("userId") userId: String
    ): ResponseEntity<Any> {
        return try {
            filesDao.signFile(fileId, userId)
            ResponseEntity("File signed successfully", HttpStatus.OK)
        } catch (e: Exception) {
            ResponseEntity(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    data class SignerRequest(
        val userId: String,
        val signatureOrder: Int? = null // Allow null values for order
    )

    data class AssignSignersRequest(
        val signers: List<SignerRequest>,
        val assigningUserId: String
    )
}
