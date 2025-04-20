package com.d4b.sid.model.db

import com.fasterxml.jackson.annotation.JsonBackReference
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "users")
data class User(
        @Id
        @Column(name = "id")
        var id: String = "",

        @Column(name = "name", nullable = false)
        var name: String = "",

        @Column(name = "date_created", updatable = false)
        var dateCreated: LocalDateTime = LocalDateTime.now(),

        @Column(name = "date_updated")
        var dateUpdated: LocalDateTime = LocalDateTime.now(),

        @ManyToMany
        @JoinTable(
                name = "user_groups",
                joinColumns = [JoinColumn(name = "user_id")],
                inverseJoinColumns = [JoinColumn(name = "group_id")]
        )
        @JsonBackReference // Prevents infinite recursion
        var groups: MutableList<Group> = mutableListOf()


) {
        override fun toString(): String {
                return "User(id='$id', name='$name')"
        }
}

