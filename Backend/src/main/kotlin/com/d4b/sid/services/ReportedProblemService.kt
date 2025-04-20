package com.d4b.sid.services

import com.d4b.sid.model.ReportedProblemRequest

interface ReportedProblemService {
    fun saveReportedProblem(problem: ReportedProblemRequest)
}