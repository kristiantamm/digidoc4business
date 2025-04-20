package com.d4b.sid.model.db

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "file_user_access")
data class FileUserAccess(
    @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

    @ManyToOne(optional = false) // Ensures this is non-nullable
        @JoinColumn(name = "file_id", nullable = false)
        val file: File = File(),

    @ManyToOne(optional = false)
        @JoinColumn(name = "user_id", nullable = false)
        val user: User = User(),

    @ManyToOne(optional = false)
        @JoinColumn(name = "shared_by", nullable = false) // Correct column name
        val sharedBy: User = User(),

    @Column(name = "date_shared", nullable = false)
        var dateShared: LocalDateTime = LocalDateTime.now()
) {



}
