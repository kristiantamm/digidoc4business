package com.d4b.sid.model.db

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "reported_problems")
data class ReportedProblem(

    @Id
    @Column(name = "user_id", nullable = false)
    val userId: String = "",

    @Column(name = "text", nullable = false)
    val text: String = "",

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)
