package com.d4b.sid.repository

import com.d4b.sid.model.db.Notification
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface NotificationRepository : JpaRepository<Notification, Long> {
    // Custom queries (if needed) can be added here
    fun findAllByRecipientId(recipientId: String): List<Notification>
}