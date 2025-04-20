package com.d4b.sid.repository

import com.d4b.sid.model.db.Group
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface GroupRepository : JpaRepository<Group, Int>
