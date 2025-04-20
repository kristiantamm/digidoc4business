package com.d4b.sid.services.sid

import com.d4b.sid.model.SigningResult
import com.d4b.sid.model.SigningSessionInfo
import com.d4b.sid.model.UserRequest
import org.springframework.stereotype.Service

interface SmartIdSignatureService {
    fun sendSignatureRequest(userRequest: UserRequest): SigningSessionInfo?

    fun sign(signingSessionInfo: SigningSessionInfo?): SigningResult?
}