package com.digidoc4business.smartid.exception

class SmartIdException : Exception {
    constructor(message: String) : super(message)
    constructor(message: String, cause: Throwable) : super(message, cause)
}
