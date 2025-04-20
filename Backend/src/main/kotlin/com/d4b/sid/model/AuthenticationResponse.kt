package com.d4b.sid.model

import ee.sk.smartid.AuthenticationIdentity

data class AuthenticationResponse(
    val authenticated: Boolean,
    val message: String,
    val identity: AuthIdentity? = null,
)
