package com.d4b.sid.services.sid

import com.d4b.sid.model.UserRequest
import ee.sk.smartid.SmartIdCertificate

interface SmartIdCertificateService {
    fun getCertificate(userRequest: UserRequest?): SmartIdCertificate?
}