package com.d4b.sid.repository

import com.d4b.sid.model.db.FileSignature
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface FileSignaturesRepository : JpaRepository<FileSignature, Long> {
    fun findByFileIdOrderBySignatureOrder(fileId: Long): List<FileSignature>
    fun findByFileIdAndSignedById(fileId: Long, signedById: String): FileSignature?
    fun findByFileId(fileId: Long): List<FileSignature>
    fun findByFileIdAndSignatureOrder(fileId: Long, signatureOrder: Int): FileSignature?
}