package com.d4b.sid.exeption


class SidOperationException : RuntimeException {
    override val message: String

    constructor(message: String) {
        this.message = message
    }

    constructor(message: String, cause: Throwable) : super(cause) {
        this.message = message + " Cause: " + cause.message
    }

    constructor(errors: List<String?>?) {
        this.message = "Smart-ID service returned validation errors: " + java.lang.String.join(", ", errors)
    }
}