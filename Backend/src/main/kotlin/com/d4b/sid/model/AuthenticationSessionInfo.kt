package com.d4b.sid.model

import ee.sk.smartid.AuthenticationHash
import ee.sk.smartid.rest.dao.SemanticsIdentifier
class AuthenticationSessionInfo private constructor(builder: Builder) {
    val authenticationHash: AuthenticationHash?
    val verificationCode: String?
    val userRequest: UserRequest?
    val semanticsIdentifier: SemanticsIdentifier?

    init {
        this.authenticationHash = builder.authenticationHash
        this.verificationCode = builder.verificationCode
        this.userRequest = builder.userRequest
        this.semanticsIdentifier = builder.semanticsIdentifier
    }

    class Builder {
        var verificationCode: String? = null
        var userRequest: UserRequest? = null
        internal var authenticationHash: AuthenticationHash? = null

        var semanticsIdentifier: SemanticsIdentifier? = null

        fun withAuthenticationHash(authenticationHash: AuthenticationHash?): Builder {
            this.authenticationHash = authenticationHash
            return this
        }

        fun withVerificationCode(verificationCode: String?): Builder {
            this.verificationCode = verificationCode
            return this
        }

        fun withUserRequest(userRequest: UserRequest?): Builder {
            this.userRequest = userRequest
            return this
        }

        fun withSemanticsIdentifier(semanticsIdentifier: SemanticsIdentifier?): Builder {
            this.semanticsIdentifier = semanticsIdentifier
            return this
        }

        fun build(): AuthenticationSessionInfo {
            return AuthenticationSessionInfo(this)
        }
    }

    companion object {
        fun newBuilder(): Builder {
            return Builder()
        }
    }
}