package com.d4b.sid.dao

import com.d4b.sid.model.db.ReportedProblem
import com.d4b.sid.model.db.User
import com.d4b.sid.repository.ReportedProblemRepository
import org.springframework.stereotype.Service

@Service
class ReportedProblemDao(
    val reportedProblemRepository: ReportedProblemRepository
) {

    fun addReportedProblem(reportedProblemRequest: com.d4b.sid.model.ReportedProblemRequest) {
        val problem = ReportedProblem(userId = reportedProblemRequest.reporterPersonalId, text = reportedProblemRequest.text)
        reportedProblemRepository.save(problem)
    }

}