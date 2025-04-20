package com.d4b.sid.model

import ee.sk.smartid.SignableHash
import org.digidoc4j.Container
import org.digidoc4j.DataToSign

class SigningSessionInfo private constructor(builder: Builder) {
    val sessionID: String? = builder.sessionID
    val verificationCode: String? = builder.verificationCode
    val dataToSign: DataToSign? = builder.dataToSign
    var container: Container? = builder.container
    val hashToSign: SignableHash? = builder.hashToSign
    var documentNumber: String? = builder.documentNumber
    var nationalIdentityNumber: String? = builder.nationalIdentityNumber
    var existingContainerFileId: Long? = builder.existingContainerFileId
    var firstFileName: String? = builder.firstFileName

    class Builder {
        var sessionID: String? = null
        var verificationCode: String? = null
        var dataToSign: DataToSign? = null
        var container: Container? = null
        var hashToSign: SignableHash? = null
        var documentNumber: String? = null
        var nationalIdentityNumber: String? = null
        var existingContainerFileId: Long? = null
        var firstFileName: String? = null

        fun withSessionID(sessionID: String) = apply { this.sessionID = sessionID }
        fun withVerificationCode(verificationCode: String) = apply { this.verificationCode = verificationCode }
        fun withDataToSign(dataToSign: DataToSign) = apply { this.dataToSign = dataToSign }
        fun withContainer(container: Container) = apply { this.container = container }
        fun withHashToSign(hashToSign: SignableHash) = apply { this.hashToSign = hashToSign }
        fun withDocumentNumber(documentNumber: String) = apply { this.documentNumber = documentNumber }
        fun withNationalIdentityNumber(nationalIdentityNumber: String) = apply { this.nationalIdentityNumber = nationalIdentityNumber }
        fun withExistingContainerFileId(fileId: Long?) = apply {this.existingContainerFileId = fileId}
        fun withFirstFileName(name: String?) = apply { this.firstFileName = name }

        fun build(): SigningSessionInfo {
            requireNotNull(verificationCode) { "Verification code must not be null" }
            requireNotNull(hashToSign) { "Hash to sign must not be null" }
            return SigningSessionInfo(this)
        }
    }

    companion object {
        fun newBuilder(): Builder {
            return Builder()
        }
    }
}
