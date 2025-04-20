package com.d4b.sid.services

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.SimpleMailMessage
import org.springframework.stereotype.Service

@Service
class EmailService(@Autowired val emailSender: JavaMailSender) {

    fun sendSimpleMessage(to: String, subject: String, text: String) {
        val message = SimpleMailMessage()
        message.setTo(to)
        message.setSubject(subject)
        message.setText(text)
        emailSender.send(message)
    }
}