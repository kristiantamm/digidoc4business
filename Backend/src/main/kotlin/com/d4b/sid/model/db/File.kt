package com.d4b.sid.model.db

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "files")
data class File(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        var id: Long = 0,

        @Column(nullable = false)
        var name: String = "",

        @Column(name = "file_content", nullable = false, columnDefinition = "TEXT")
        var fileContent: String = "",

        @Column(name = "uploaded_by", nullable = false)
        var uploadedBy: String = "",

        @Column(name = "date_uploaded", nullable = false, updatable = false)
        var dateUploaded: LocalDateTime = LocalDateTime.now()
)

