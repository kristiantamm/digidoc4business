package com.d4b.sid.services.sid

import com.d4b.sid.model.UserRequest
import com.d4b.sid.exeption.SidOperationException
import com.d4b.sid.model.AuthenticationSessionInfo
import ee.sk.smartid.*
import ee.sk.smartid.exception.UnprocessableSmartIdResponseException
import ee.sk.smartid.exception.permanent.ServerMaintenanceException
import ee.sk.smartid.exception.useraccount.CertificateLevelMismatchException
import ee.sk.smartid.exception.useraccount.DocumentUnusableException
import ee.sk.smartid.exception.useraccount.UserAccountNotFoundException
import ee.sk.smartid.exception.useraction.SessionTimeoutException
import ee.sk.smartid.exception.useraction.UserRefusedException
import ee.sk.smartid.exception.useraction.UserSelectedWrongVerificationCodeException
import ee.sk.smartid.rest.dao.Interaction
import ee.sk.smartid.rest.dao.SemanticsIdentifier
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class SmartIdAuthenticationServiceImpl(
    private val client: SmartIdClient,
    private val sidAuthenticationResponseValidator: AuthenticationResponseValidator
) : SmartIdAuthenticationService {
    @Value("\${sid.auth.displayText}")
    private val sidAuthDisplayText: String? = null

    override fun startAuthentication(userRequest: UserRequest): AuthenticationSessionInfo {
        val semanticsIdentifier = SemanticsIdentifier( // 3 character identity type
            // (PAS-passport, IDC-national identity card or PNO - (national) personal number)
            SemanticsIdentifier.IdentityType.PNO,
            userRequest.country,
            userRequest.nationalIdentityNumber
        ) // identifier (according to country and identity type reference)

        // For security reasons a new hash value must be created for each new authentication request
        val authenticationHash = AuthenticationHash.generateRandomHash()

        val verificationCode = authenticationHash.calculateVerificationCode()

        return AuthenticationSessionInfo.newBuilder()
            .withUserRequest(userRequest)
            .withAuthenticationHash(authenticationHash)
            .withVerificationCode(verificationCode)
            .withSemanticsIdentifier(semanticsIdentifier)
            .build()
    }

    override fun authenticate(authenticationSessionInfo: AuthenticationSessionInfo): AuthenticationIdentity {
        val userRequest: UserRequest = authenticationSessionInfo.userRequest ?: throw SidOperationException("User request not found")
        val authenticationHash: AuthenticationHash = authenticationSessionInfo.authenticationHash ?: throw SidOperationException("Authentication hash not found")

        val authIdentity: AuthenticationIdentity

        try {
            val response = client
                .createAuthentication()
                .withSemanticsIdentifier(authenticationSessionInfo.semanticsIdentifier)
                .withAuthenticationHash(authenticationHash)
                .withCertificateLevel("QUALIFIED") // Certificate level can either be "QUALIFIED" or "ADVANCED"
                // Smart-ID app will display verification code to the user and user must insert PIN1
                .withAllowedInteractionsOrder(
                    listOf(
                        Interaction.displayTextAndPIN(sidAuthDisplayText)
                    )
                )
                .authenticate()


            // throws SmartIdResponseValidationException if validation doesn't pass
            authIdentity = sidAuthenticationResponseValidator.validate(response)

            val givenName = authIdentity.givenName // e.g. Mari-Liis"
            val surname = authIdentity.surname // e.g. "Männik"
            val identityCode = authIdentity.identityCode // e.g. "47101010033"
            val country = authIdentity.country // e.g. "EE", "LV", "LT", "BE"
            val dateOfBirth = authIdentity.dateOfBirth // see next paragraph
        } catch (e: UserAccountNotFoundException) {
            throw SidOperationException("User account was not found", e)
        } catch (e: UserRefusedException) {
            throw SidOperationException("User refused", e)
        } catch (e: UserSelectedWrongVerificationCodeException) {
            throw SidOperationException("User selected wrong verification code", e)
        } catch (e: SessionTimeoutException) {
            throw SidOperationException("Session Timeout", e)
        } catch (e: DocumentUnusableException) {
            throw SidOperationException("Document Unusable", e)
        } catch (e: ServerMaintenanceException) {
            throw SidOperationException("Server is under maintenance", e)
        } catch (e: UnprocessableSmartIdResponseException) {
            throw SidOperationException("SID internal error (Unprocessable Smart-ID response)", e)
        } catch (e: CertificateLevelMismatchException) {
            throw SidOperationException("Certificate Level Mismatch", e)
        }

        return authIdentity
    }

    companion object {
        private val logger: Logger = LoggerFactory.getLogger(SmartIdAuthenticationServiceImpl::class.java)
    }
}