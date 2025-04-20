package com.d4b.sid.controller

import com.d4b.sid.model.db.Notification
import com.d4b.sid.repository.NotificationRepository
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.nio.file.Files

@RestController
@RequestMapping("/notifications")
class NotificationController(
    private val notificationRepository: NotificationRepository
) {

    // Fetch notifications by personalId (recipientId)
    @GetMapping
    fun getNotificationsByPersonalId(@RequestParam("personalId") personalId: String): ResponseEntity<List<Notification>> {
        val filteredNotifications = notificationRepository.findAllByRecipientId(personalId)
        return if (filteredNotifications.isNotEmpty()) {
            // Return a 200 OK status with the notifications
            ResponseEntity(filteredNotifications, HttpStatus.OK)
        } else {
            // If no notifications are found, return an empty list with 204 NO CONTENT status
            ResponseEntity(emptyList(), HttpStatus.NO_CONTENT)
        }
    }

    @PostMapping
    fun addNotification(
        @RequestParam("recipientId") recipientId: String,
        @RequestParam("text") text: String
    ): Notification{
        val newNotification = Notification(
            recipientId = recipientId,
            text = text,
            isRead = false
        )
        return notificationRepository.save(newNotification) // Save it to the database
    }

    @PostMapping("/{id}/read")
    fun markAsRead(@PathVariable id: Long): String {
        val notification = notificationRepository.findById(id).orElseThrow {
            RuntimeException("Notification with ID $id not found")
        }
        notification.isRead = true
        notificationRepository.save(notification) // Update the 'read' status
        return "Notification marked as read"
    }

    @PostMapping("/{id}/unread")
    fun markAsUnread(@PathVariable id: Long): String {
        val notification = notificationRepository.findById(id).orElseThrow {
            RuntimeException("Notification with ID $id not found")
        }
        notification.isRead = false
        notificationRepository.save(notification) // Update the 'isRead' status
        return "Notification marked as unread"
    }
}