package com.d4b.sid.model

data class SigningResponse (
    val signed: Boolean,
    val message: String,
    val signingResult: SigningResult? = null,
)