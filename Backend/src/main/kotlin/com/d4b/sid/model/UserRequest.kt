package com.d4b.sid.model

import com.d4b.sid.model.db.File
import org.digidoc4j.Container
import org.springframework.web.multipart.MultipartFile
import javax.validation.constraints.NotNull
import javax.validation.constraints.Pattern

data class UserRequest(
        @field:NotNull
        @field:Pattern(regexp = "(EE|LV|LT)", message = "Invalid country number")
        val country: String,

        @field:NotNull
        @field:Pattern(regexp = "([0-9]{11})|([0-9]{6}-[0-9]{5})", message = "Invalid national identity number")
        val nationalIdentityNumber: String,

        var files: List<MultipartFile>? = null,

        var container: File? = null
)
