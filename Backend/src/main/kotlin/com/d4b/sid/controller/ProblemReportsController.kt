package com.d4b.sid.controller

import com.d4b.sid.model.ReportedProblemRequest
import com.d4b.sid.services.ReportedProblemService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/report")
internal class ProblemReportsController (
    private val reportsService: ReportedProblemService,
) {

    @PostMapping
    fun uploadProblem(@RequestBody request: ReportedProblemRequest) {
        reportsService.saveReportedProblem(request)
    }

}