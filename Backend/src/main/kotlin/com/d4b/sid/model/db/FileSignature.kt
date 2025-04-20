package com.d4b.sid.model.db

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "file_signatures")
data class FileSignature(
    @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "id")
        val id: Long = 0,

    @ManyToOne
        @JoinColumn(name = "file_id", nullable = false)
        val file: File = File(),

    @ManyToOne
        @JoinColumn(name = "signed_by", nullable = false)
        val signedBy: User = User(),

    @Column(name = "signature_order", nullable = false)
        var signatureOrder: Int = 0,

    @Column(name = "is_signed", nullable = false)
        var isSigned: Boolean = false,

    @Column(name = "date_signed")
        var dateSigned: LocalDateTime? = null
)