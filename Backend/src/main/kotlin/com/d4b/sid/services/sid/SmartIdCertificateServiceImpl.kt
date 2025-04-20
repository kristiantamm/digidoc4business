package com.d4b.sid.services.sid

import com.d4b.sid.exeption.SidOperationException
import com.d4b.sid.model.UserRequest
import ee.sk.smartid.SmartIdCertificate
import ee.sk.smartid.SmartIdClient
import ee.sk.smartid.exception.permanent.ServerMaintenanceException
import ee.sk.smartid.exception.permanent.SmartIdClientException
import ee.sk.smartid.exception.useraccount.DocumentUnusableException
import ee.sk.smartid.exception.useraccount.UserAccountNotFoundException
import ee.sk.smartid.exception.useraction.SessionTimeoutException
import ee.sk.smartid.exception.useraction.UserRefusedException
import ee.sk.smartid.rest.dao.SemanticsIdentifier
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class SmartIdCertificateServiceImpl(private val client: SmartIdClient) : SmartIdCertificateService {
    override fun getCertificate(userRequest: UserRequest?): SmartIdCertificate? {
        try {
            val semanticsIdentifier = SemanticsIdentifier( // 3 character identity type
                // (PAS-passport, IDC-national identity card or PNO - (national) personal number)
                SemanticsIdentifier.IdentityType.PNO,
                userRequest!!.country,  // 2 character ISO 3166-1 alpha-2 country code
                userRequest.nationalIdentityNumber
            )


            val responseWithSigningCertificate = client
                .certificate
                .withSemanticsIdentifier(semanticsIdentifier)
                .withCertificateLevel("QUALIFIED")
                .fetch() // TODO preserve document number

            // 2023-03-29 11:15:24,735 TRACE ee.sk.smartid.rest.LoggingFilter: Response body: {"state":"COMPLETE","result":{"endResult":"OK","documentNumber":"PNOEE-50001029996-MOCK-Q"},"cert":{"value":"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","certificateLevel":"QUALIFIED"}}
            return responseWithSigningCertificate
        } catch (e: UserAccountNotFoundException) {
            logger.warn("SID service returned error")
            throw SidOperationException("SID error", e)
        } catch (e: UserRefusedException) {
            logger.warn("SID service returned error")
            throw SidOperationException("SID error", e)
        } catch (e: SessionTimeoutException) {
            logger.warn("SID service returned error")
            throw SidOperationException("SID error", e)
        } catch (e: DocumentUnusableException) {
            logger.warn("SID service returned error")
            throw SidOperationException("SID error", e)
        } catch (e: SmartIdClientException) {
            logger.warn("SID service returned error")
            throw SidOperationException("SID error", e)
        } catch (e: ServerMaintenanceException) {
            logger.warn("SID service returned error")
            throw SidOperationException("SID error", e)
        }
    }

    companion object {
        private val logger: Logger = LoggerFactory.getLogger(SmartIdCertificateServiceImpl::class.java)
    }
}