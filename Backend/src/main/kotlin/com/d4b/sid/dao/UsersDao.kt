package com.d4b.sid.dao

import com.d4b.sid.model.db.User
import com.d4b.sid.repository.UserRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class UsersDao(private val userRepository: UserRepository) {

    fun addUser(id: String, name: String): User {
        val user = User(id = id, name = name, dateUpdated = LocalDateTime.now())
        return userRepository.save(user)
    }

    fun getAllUsers(): List<User> {
        return userRepository.findAll()
    }

    fun getUserById(id: String): User? {
        return userRepository.findById(id).orElse(null)
    }
}