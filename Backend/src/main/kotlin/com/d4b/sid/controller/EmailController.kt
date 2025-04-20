package com.d4b.sid.controller

import com.d4b.sid.services.EmailService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/email")
class EmailController(@Autowired val emailService: EmailService) {

    @PostMapping("/send")
    fun sendEmail(@RequestBody emailRequest: EmailRequest): String {
        emailService.sendSimpleMessage(emailRequest.to, emailRequest.subject, emailRequest.body)
        return "Email sent successfully!"
    }
}

// Data class for the request body
data class EmailRequest(val to: String, val subject: String, val body: String)
