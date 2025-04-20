package com.d4b.sid.repository

import com.d4b.sid.model.db.File
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface FileRepository : JpaRepository<File, Long> {
    fun findByUploadedBy(uploadedBy: String): List<File>
}