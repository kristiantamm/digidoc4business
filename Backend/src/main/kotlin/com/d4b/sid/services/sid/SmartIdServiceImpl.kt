package com.d4b.sid.services.sid

import com.d4b.sid.dao.FilesDao
import com.d4b.sid.dao.UsersDao
import com.d4b.sid.exeption.SidOperationException
import com.d4b.sid.model.*
import com.d4b.sid.model.db.File
import ee.sk.smartid.AuthenticationIdentity
import org.springframework.mock.web.MockMultipartFile
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.util.*
import java.util.concurrent.Executors
import java.util.concurrent.Future
import java.util.concurrent.TimeUnit
import java.util.concurrent.TimeoutException
import kotlin.collections.List

@Service
class SmartIdServiceImpl(
    private var authenticationService: SmartIdAuthenticationServiceImpl,
    private var userSidSession: UserSidSession,
    private val signatureService: SmartIdSignatureService,
    private val usersDao: UsersDao,
    private val filesDao: FilesDao,
): SmartIdService {
    override fun getAuthVerificationCode(userRequest: UserRequest): String? {
        val authSession = authenticationService.startAuthentication(userRequest)
        userSidSession.authenticationSessionInfo = authSession
        return authSession.verificationCode
    }

    override fun authenticate(): AuthenticationResponse {
        if (userSidSession.authenticationSessionInfo == null) {
            return AuthenticationResponse(authenticated = false, message = "Authentication session not initiated")
        }
        try {
            val auth = authenticationService.authenticate(userSidSession.authenticationSessionInfo!!)
            val identity = registerOrGetUser(auth)
            return AuthenticationResponse(authenticated = true, message = "Success", identity = identity)
        } catch (e: SidOperationException) {
            return AuthenticationResponse(authenticated = false, message = e.message)
        }
    }

    private fun registerOrGetUser(auth: AuthenticationIdentity): AuthIdentity? {
        val user = usersDao.getUserById(auth.identityNumber)
        if (user != null) {
            return AuthIdentity(name = user.name, identityNumber = user.id)
        } else {
            val fullName = "${auth.givenName.lowercase().replaceFirstChar { it.uppercase() }} ${auth.surname.lowercase().replaceFirstChar { it.uppercase() }}"
            usersDao.addUser(auth.identityNumber, fullName)
            return AuthIdentity(name = fullName, identityNumber = auth.identityNumber)
        }
    }

    override fun getSignVerificationCode(request: SignRequest): String? {
        val personalId = request.personalId
        val files = request.fileIds.map { fileId ->
            filesDao.getFile(fileId, request.personalId)
        }
        //TODO: Add column isASICE or isContainer to files table in database.
        if (files.size == 1 && files[0].name.endsWith(".asice", ignoreCase = true)){
            val container = files[0]

            val userRequest = UserRequest(
                country = "EE",
                nationalIdentityNumber = personalId,
                container = container
            )

            val signingSessionInfo = signatureService.sendSignatureRequest(userRequest)
            userSidSession.signingSessionInfo = signingSessionInfo

            return signingSessionInfo?.verificationCode
        } else {
            val filesAsMultipartFile = getMultipartFiles(files)

            val userRequest = UserRequest(
                country = "EE",
                nationalIdentityNumber = personalId,
                files = filesAsMultipartFile
            )

            val signingSessionInfo = signatureService.sendSignatureRequest(userRequest)
            userSidSession.signingSessionInfo = signingSessionInfo

            return signingSessionInfo?.verificationCode
        }
    }

    override fun sign(): SigningResponse {
        if (userSidSession.signingSessionInfo == null) {
            return SigningResponse(signed = false, message = "Signing session not initiated")
        }

        val executor = Executors.newSingleThreadExecutor()
        try {

            val future: Future<SigningResult?> = executor.submit<SigningResult?> {
                signatureService.sign(userSidSession.signingSessionInfo)
            }

            val signingResult = future.get(20, TimeUnit.SECONDS)

            return SigningResponse(signed = true, message = "Success", signingResult = signingResult)
        } catch (e: SidOperationException) {
            return SigningResponse(signed = false, message = e.message)
        } catch (e: TimeoutException) {
            return SigningResponse(signed = false, message = "Signature service timed out after 20 seconds." +
                    "Probable cause: you are using DEMO environment.")
        }
    }

    private fun getMultipartFiles(files: List<File>): List<MultipartFile> {
        return files.map { file ->
            val decodedBytes = Base64.getDecoder().decode(file.fileContent)
            val fileName = file.name
            val fileExtension = fileName.substringAfterLast('.', "")
            val contentType = when (fileExtension.lowercase()) {
                "pdf" -> "application/pdf"
                "txt" -> "text/plain"
                "jpg", "jpeg" -> "image/jpeg"
                "png" -> "image/png"
                "gif" -> "image/gif"
                "zip" -> "application/zip"
                "html" -> "text/html"
                "csv" -> "text/csv"
                else -> "application/octet-stream"
            }

            MockMultipartFile(fileName, fileName, contentType, decodedBytes)
        }
    }

}
