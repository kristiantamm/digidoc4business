package com.d4b.sid.model.db
import jakarta.persistence.*

@Entity
@Table(name = "notification")
data class Notification(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val recipientId: String = "",

    @Column(nullable = false)
    val text: String,

    @Column(nullable = false)
    var isRead: Boolean = false
) {
    constructor() : this(recipientId = "", text = "", isRead = false) {

    }
}