package com.d4b.sid.controller

import com.d4b.sid.model.*
import com.d4b.sid.services.sid.SmartIdService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/sid")
class SmartIdController(
    private val sidService: SmartIdService,
) {

    @PostMapping("/startAuthentication")
    fun startAuthentication(@RequestBody req: IsikukoodRequest): String? {
        val userRequest = UserRequest(country = req.country, nationalIdentityNumber = req.personalId)
        return sidService.getAuthVerificationCode(userRequest)
    }

    @PostMapping("/authenticate")
    fun authenticateIdentity(): AuthenticationResponse {
        return sidService.authenticate()
    }

    @PostMapping("/startSign")
    fun startSign(@RequestBody request: SignRequest): String? {
        return sidService.getSignVerificationCode(request)
    }

    @PostMapping("/sign")
    fun sign(): SigningResponse {
        return sidService.sign()
    }
}