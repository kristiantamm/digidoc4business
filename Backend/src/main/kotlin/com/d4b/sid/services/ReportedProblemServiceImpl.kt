package com.d4b.sid.services

import com.d4b.sid.dao.ReportedProblemDao
import com.d4b.sid.model.ReportedProblemRequest
import org.springframework.stereotype.Service

@Service
class ReportedProblemServiceImpl(
    private val reportedProblemsDao: ReportedProblemDao
): ReportedProblemService {

    override fun saveReportedProblem(problem: ReportedProblemRequest) {
        reportedProblemsDao.addReportedProblem(problem)
    }

}