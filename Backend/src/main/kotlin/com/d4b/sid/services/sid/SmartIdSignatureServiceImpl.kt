package com.d4b.sid.services.sid

import com.d4b.sid.exeption.SidOperationException
import com.d4b.sid.model.SigningResult
import com.d4b.sid.model.SigningSessionInfo
import com.d4b.sid.model.UserRequest
import com.d4b.sid.services.FilesService
import ee.sk.smartid.*
import ee.sk.smartid.exception.permanent.ServerMaintenanceException
import ee.sk.smartid.exception.useraccount.DocumentUnusableException
import ee.sk.smartid.exception.useraccount.UserAccountNotFoundException
import ee.sk.smartid.exception.useraction.SessionTimeoutException
import ee.sk.smartid.exception.useraction.UserRefusedException
import ee.sk.smartid.exception.useraction.UserSelectedWrongVerificationCodeException
import ee.sk.smartid.rest.dao.Interaction
import ee.sk.smartid.rest.dao.SemanticsIdentifier
import org.apache.tomcat.util.http.fileupload.FileUploadException
import org.digidoc4j.*
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.mock.web.MockMultipartFile
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.io.ByteArrayInputStream
import java.io.File
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.*

@Service
class SmartIdSignatureServiceImpl(
    private val certificateService: SmartIdCertificateService,
    private val client: SmartIdClient,
    private val filesService: FilesService,
) : SmartIdSignatureService {
    @Value("\${sid.sign.displayText}")
    private val sidSignDisplayText: String? = null

    @Value("\${sid.client.relyingPartyUuid}")
    private val sidRelyingPartyUuid: String? = null

    @Value("\${sid.client.relyingPartyName}")
    private val sidRelyingPartyName: String? = null

    @Value("\${app.signed-files-directory}")
    private val signedFilesDirectory: String? = null

    @Value("\${project.directory.path}")
    private val projectDirectoryPath: String? = null

    override fun sendSignatureRequest(userRequest: UserRequest): SigningSessionInfo? {

        val configuration = Configuration(Configuration.Mode.TEST)

        val firstFileName = userRequest.files?.first()?.name?.split(".")?.get(0)

        configuration.lotlLocation = "https://open-eid.github.io/test-TL/tl-mp-test-EE.xml"
        configuration.lotlTruststorePath =
            "$projectDirectoryPath/Backend/src/main/kotlin/com/d4b/sid/services/tlskeystore.jks"
        configuration.lotlTruststorePassword = "smartsign";
        configuration.lotlTruststoreType = "JKS";

        val containerBuilder = ContainerBuilder.aContainer().withConfiguration(configuration)

        if (userRequest.container != null) {

            val base64Content = userRequest.container!!.fileContent
            val decodedBytes = Base64.getDecoder().decode(base64Content)
            val byteArrayInputStream = ByteArrayInputStream(decodedBytes)

            containerBuilder.fromStream(byteArrayInputStream)

        } else {

            val uploadedFiles = userRequest.files?.map {
                getUploadedDataFile(it)
            } ?: throw SidOperationException("No Files Uploaded")

            for (file in uploadedFiles) {
                containerBuilder.withDataFile(file)
            }
        }

        val container = containerBuilder.build()

        val signingCert = certificateService.getCertificate(userRequest)

        val dataToSignExternally = SignatureBuilder.aSignature(container)
            .withSigningCertificate(signingCert!!.certificate)
            .withSignatureDigestAlgorithm(DigestAlgorithm.SHA256)
            .withSignatureProfile(SignatureProfile.LT)
            .buildDataToSign()


        val signableData = SignableData(dataToSignExternally.dataToSign)
        signableData.hashType = HashType.SHA256

        val hashToSign = SignableHash()
        hashToSign.setHash(signableData.calculateHash())
        hashToSign.hashType = signableData.hashType


        return SigningSessionInfo.Builder()
            .withVerificationCode(hashToSign.calculateVerificationCode())
            .withDataToSign(dataToSignExternally)
            .withContainer(container)
            .withDocumentNumber(signingCert.documentNumber)
            .withHashToSign(hashToSign)
            .withNationalIdentityNumber(userRequest.nationalIdentityNumber)
            .withExistingContainerFileId(userRequest.container?.id)
            .withFirstFileName(firstFileName)
            .build()
    }

    private fun getUploadedDataFile(uploadedFile: MultipartFile?): DataFile {
        try {
            return DataFile(uploadedFile!!.inputStream, uploadedFile.originalFilename, uploadedFile.contentType)
        } catch (e: IOException) {
            throw FileUploadException(e.cause.toString())
        }
    }

    override fun sign(signingSessionInfo: SigningSessionInfo?): SigningResult? {
        val signature: Signature?
        val targetPath: Path?

        try {
            val smartIdSignature = client
                .createSignature()
                .withDocumentNumber(signingSessionInfo!!.documentNumber)
                .withSignableHash(signingSessionInfo.hashToSign)
                .withCertificateLevel("QUALIFIED")
                .withAllowedInteractionsOrder(
                    listOf(
                        Interaction.confirmationMessage("Confirmation message dialogue"),
                        Interaction.displayTextAndPIN("Do you want to sign the file?")
                    )
                )
                .sign()

            val signatureValue = smartIdSignature.value

            signingSessionInfo.dataToSign
            signature = signingSessionInfo.dataToSign?.finalize(signatureValue)
            signingSessionInfo.container!!.addSignature(signature)
            val containerFile = File.createTempFile(signingSessionInfo.firstFileName + "-sid-container", ".asice")
            targetPath = createSavePath(containerFile)

            signingSessionInfo.nationalIdentityNumber?.let {
                if (signingSessionInfo.existingContainerFileId == null) {
                    saveContainer(signingSessionInfo.container!!.saveAsFile(targetPath.toString()),
                        it
                    )
                } else {
                    overwriteExistingContainerData(
                        signingSessionInfo.container!!.saveAsFile(targetPath.toString()),
                        it,
                        signingSessionInfo.existingContainerFileId!!,
                    )
                }

            }


        } catch (e: UserAccountNotFoundException) {
            logger.warn("Smart-ID service returned internal error that cannot be handled locally.")
            throw SidOperationException("Smart-ID internal error", e)
        } catch (e: UserRefusedException) {
            logger.warn("Smart-ID service returned internal error that cannot be handled locally.")
            throw SidOperationException("Smart-ID internal error", e)
        } catch (e: UserSelectedWrongVerificationCodeException) {
            logger.warn("Smart-ID service returned internal error that cannot be handled locally.")
            throw SidOperationException("Smart-ID internal error", e)
        } catch (e: SessionTimeoutException) {
            logger.warn("Smart-ID service returned internal error that cannot be handled locally.")
            throw SidOperationException("Smart-ID internal error", e)
        } catch (e: DocumentUnusableException) {
            logger.warn("Smart-ID service returned internal error that cannot be handled locally.")
            throw SidOperationException("Smart-ID internal error", e)
        } catch (e: ServerMaintenanceException) {
            logger.warn("Smart-ID service returned internal error that cannot be handled locally.")
            throw SidOperationException("Smart-ID internal error", e)
        } catch (e: IOException) {
            throw SidOperationException("Could not create container file.", e)
        }

        if (signature != null) {
            return SigningResult.newBuilder()
                .withResult("Signing successful")
                .withValid(signature.validateSignature().isValid)
                .withTimestamp(signature.timeStampCreationTime)
                .withContainerFilePath(targetPath.toString())
                .build()
        }
        return null
    }

    private fun overwriteExistingContainerData(container: File, identityNumber: String, fileId: Long) {
        try {

            val multipartFile = MockMultipartFile(
                container.name,
                container.name,
                Files.probeContentType(container.toPath()),
                Files.readAllBytes(container.toPath())
            )

            val file = filesService.overwriteFile(multipartFile, fileId)
            filesService.signFile(file.id, identityNumber)

            if (container.delete()) {
                println("File deleted successfully: ${container.absolutePath}")
            } else {
                println("Failed to delete the file: ${container.absolutePath}")
            }
        } catch (ex: Exception) {
            println("An error occurred while saving the file or deleting the container: ${ex.message}")
            ex.printStackTrace()
        }
    }

    private fun saveContainer(container: File, identityNumber: String) {
        try {

            val multipartFile = MockMultipartFile(
                container.name,
                container.name,
                Files.probeContentType(container.toPath()),
                Files.readAllBytes(container.toPath())
            )

            val file = filesService.saveFile(multipartFile, identityNumber)
            filesService.signFile(file.id, identityNumber)

            if (container.delete()) {
                println("File deleted successfully: ${container.absolutePath}")
            } else {
                println("Failed to delete the file: ${container.absolutePath}")
            }
        } catch (ex: Exception) {
            println("An error occurred while saving the file or deleting the container: ${ex.message}")
            ex.printStackTrace()
        }
    }

    private fun createSavePath(containerFile: File): Path? {
        val targetDir = signedFilesDirectory?.let { Paths.get(it) }
        val directory = targetDir?.toFile()
        if (directory != null) {
            if (!directory.exists()) {
                directory.mkdirs()
            }
        }
        if (targetDir != null) {
            return targetDir.resolve(containerFile.name)
        }
        return null
    }

    companion object {
        private val logger: Logger = LoggerFactory.getLogger(SmartIdSignatureServiceImpl::class.java)
    }
}