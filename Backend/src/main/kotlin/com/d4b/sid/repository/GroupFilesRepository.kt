package com.d4b.sid.repository

import com.d4b.sid.model.db.GroupFile
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface GroupFilesRepository : JpaRepository<GroupFile, Long> {
    fun findByFileId(fileId: Long): List<GroupFile>
    fun findByGroupId(groupId: Int): List<GroupFile>
    fun existsByFileIdAndGroupId(fileId: Long, groupId: Int): Boolean
    fun existsByFileIdAndGroupIdIn(fileId: Long, groupIds: List<Int>): Boolean
    fun findByGroupIdAndFileId(groupId: Int, fileId: Long): GroupFile?
}