package com.d4b.sid

import com.d4b.sid.model.UserSidSession
import ee.sk.smartid.AuthenticationResponseValidator
import ee.sk.smartid.SmartIdClient
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Scope
import org.springframework.context.annotation.ScopedProxyMode
import org.springframework.web.context.WebApplicationContext
import java.security.KeyStore
import java.security.cert.X509Certificate
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class Config {
    @Value("\${sid.client.relyingPartyUuid}")
    private val sidRelyingPartyUuid: String? = null

    @Value("\${sid.client.relyingPartyName}")
    private val sidRelyingPartyName: String? = null

    @Value("\${sid.client.applicationProviderHost}")
    private val sidApplicationProviderHost: String? = null

    @Value("\${sid.truststore.trusted-server-ssl-certs.filename}")
    private val sidTrustedServerSslCertsFilename: String? = null

    @Value("\${sid.truststore.trusted-server-ssl-certs.password}")
    private val sidTrustedServerSslCertsPassword: String? = null

    @Value("\${sid.truststore.trusted-root-certs.filename}")
    private val sidTrustedRootCertsFilename: String? = null

    @Value("\${sid.truststore.trusted-root-certs.password}")
    private val sidTrustedRootCertsPassword: String? = null



    @Bean
    @Throws(Exception::class)
    fun smartIdClient(): SmartIdClient {
        val `is` = sidTrustedServerSslCertsFilename?.let { Config::class.java.getResourceAsStream(it) }
        val trustStore = KeyStore.getInstance("PKCS12")
        trustStore.load(`is`, sidTrustedServerSslCertsPassword!!.toCharArray())

        // Client setup. Note that these values are demo environment specific.
        val client = SmartIdClient()
        client.relyingPartyUUID = sidRelyingPartyUuid
        client.relyingPartyName = sidRelyingPartyName
        client.setHostUrl(sidApplicationProviderHost)
        client.setTrustStore(trustStore)

        return client
    }

    @Bean
    @Scope(value = WebApplicationContext.SCOPE_SESSION, proxyMode = ScopedProxyMode.TARGET_CLASS)
    fun userSessionSigning(): UserSidSession {
        return UserSidSession()
    }

    @Bean
    @Throws(Exception::class)
    fun sidResponseValidator(): AuthenticationResponseValidator {
        val certificates: MutableList<X509Certificate> = ArrayList()

        val `is` = sidTrustedRootCertsFilename?.let { Config::class.java.getResourceAsStream(it) }

        val keystore = KeyStore.getInstance(KeyStore.getDefaultType())
        keystore.load(`is`, sidTrustedRootCertsPassword!!.toCharArray())
        val aliases = keystore.aliases()

        while (aliases.hasMoreElements()) {
            val alias = aliases.nextElement()
            val certificate = keystore.getCertificate(alias) as X509Certificate
            certificates.add(certificate)
        }

        return AuthenticationResponseValidator(certificates.toTypedArray<X509Certificate>())
    }
    @Bean
    fun corsConfigurer(): WebMvcConfigurer {
        return object : WebMvcConfigurer {
            override fun addCorsMappings(registry: CorsRegistry) {
                registry.addMapping("/**")
                    .allowedOrigins(
                        "http://localhost:8081",
                        "http://localhost:8064"
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true)
            }
        }
    }
}