package com.d4b.sid.services.sid

import com.d4b.sid.model.AuthenticationSessionInfo
import com.d4b.sid.model.UserRequest
import ee.sk.smartid.AuthenticationIdentity

interface SmartIdAuthenticationService {
    fun startAuthentication(userRequest: UserRequest): AuthenticationSessionInfo

    fun authenticate(authenticationSessionInfo: AuthenticationSessionInfo): AuthenticationIdentity
}