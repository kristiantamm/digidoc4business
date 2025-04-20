package com.d4b.sid.model

import java.util.*


class SigningResult private constructor(builder: Builder) {
    val result: String?
    val valid: Boolean?
    val timestamp: Date?
    val containerFilePath: String?

    init {
        this.result = builder.result
        this.valid = builder.valid
        this.timestamp = builder.timestamp
        this.containerFilePath = builder.containerFilePath
    }

    class Builder {
        internal var result: String? = null
        var valid: Boolean? = null
        var timestamp: Date? = null
        var containerFilePath: String? = null

        fun withResult(result: String?): Builder {
            this.result = result
            return this
        }

        fun withValid(valid: Boolean?): Builder {
            this.valid = valid
            return this
        }

        fun withTimestamp(timestamp: Date?): Builder {
            this.timestamp = timestamp
            return this
        }

        fun withContainerFilePath(containerFilePath: String?): Builder {
            this.containerFilePath = containerFilePath
            return this
        }

        fun build(): SigningResult {
            return SigningResult(this)
        }
    }

    companion object {
        fun newBuilder(): Builder {
            return Builder()
        }
    }
}