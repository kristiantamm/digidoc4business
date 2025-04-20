package com.d4b.sid.repository

import com.d4b.sid.model.db.ReportedProblem
import com.d4b.sid.model.db.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ReportedProblemRepository : JpaRepository<ReportedProblem, String>