package com.d4b.sid.repository

import com.d4b.sid.model.db.FileUserAccess
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface FileUserAccessRepository : JpaRepository<FileUserAccess, Long> {
    fun findByFileId(fileId: Long): List<FileUserAccess>
    fun findByUserId(userId: String): List<FileUserAccess>
    fun findByFileIdAndUserId(fileId: Long, userId: String): FileUserAccess?

    // Add the missing method
    fun existsByFileIdAndUserId(fileId: Long, userId: String): Boolean
}
