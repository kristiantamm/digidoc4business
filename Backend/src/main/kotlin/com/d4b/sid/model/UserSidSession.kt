package com.d4b.sid.model

open class UserSidSession {
    var signingSessionInfo: SigningSessionInfo? = null
    var authenticationSessionInfo: AuthenticationSessionInfo? = null

    open fun clearSigningSession() {
        this.signingSessionInfo = null
    }

    open fun clearAuthenticationSessionInfo() {
        this.authenticationSessionInfo = null
    }
}
