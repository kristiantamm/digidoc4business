package com.d4b.sid.controller

import com.d4b.sid.dao.UsersDao
import com.d4b.sid.model.db.User
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/users")
class UserController(private val usersDao: UsersDao) {

    @PostMapping
    fun addUser(@RequestParam id: String, @RequestParam name: String): User {
        return usersDao.addUser(id, name)
    }

    @GetMapping
    fun getAllUsers(): List<User> {
        return usersDao.getAllUsers()
    }

    @GetMapping("/{id}")
    fun getUserById(@PathVariable id: String): User? {
        return usersDao.getUserById(id)
    }

}