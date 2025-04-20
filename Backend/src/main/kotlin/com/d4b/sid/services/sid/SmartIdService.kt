package com.d4b.sid.services.sid

import com.d4b.sid.model.AuthenticationResponse
import com.d4b.sid.model.SignRequest
import com.d4b.sid.model.SigningResponse
import com.d4b.sid.model.UserRequest
import org.springframework.stereotype.Service

interface SmartIdService {
    fun getAuthVerificationCode(userRequest: UserRequest): String?

    fun authenticate(): AuthenticationResponse

    fun getSignVerificationCode(request: SignRequest): String?

    fun sign(): SigningResponse
}