package com.d4b.sid.services

import com.d4b.sid.model.db.File
import org.springframework.web.multipart.MultipartFile

interface FilesService {
    fun saveFile(file: MultipartFile, uploadedBy: String): File

    fun overwriteFile(file: MultipartFile, fileId: Long): File

    fun createContainer(fileId: Long, requestingUserId: String, groupId: Int): File

    fun addFilesToGroup(fileIds: List<Long>, groupId: Int, userId: String)

    fun signFile(fileId: Long, signingUserId: String)
}