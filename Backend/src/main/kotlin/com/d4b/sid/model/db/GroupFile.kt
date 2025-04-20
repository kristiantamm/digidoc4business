package com.d4b.sid.model.db

import jakarta.persistence.*
import java.sql.Timestamp

@Entity
@Table(name = "group_files")
data class GroupFile(
    @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

    @ManyToOne
        @JoinColumn(name = "group_id", nullable = false)
        val group: Group = Group(),

    @ManyToOne
        @JoinColumn(name = "file_id", nullable = false)
        val file: File = File(),

    @Column(name = "date_added", nullable = false, updatable = false, insertable = false)
        val dateAdded: Timestamp = Timestamp(System.currentTimeMillis()),

    @Column(name = "uploaded_by", nullable = false)
        val uploadedBy: String = ""
)
