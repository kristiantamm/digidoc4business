package com.d4b.sid.model

data class SignRequest (
    val personalId: String,
    val fileIds: List<Long>,
)