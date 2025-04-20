package com.d4b.sid.model.db

import com.fasterxml.jackson.annotation.JsonManagedReference
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "groups")
data class Group(
    @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        var id: Int = 0,

    @Column(nullable = false)
        var name: String = "",

    @ManyToOne
        @JoinColumn(name = "owner_id", nullable = false)
        var owner: User = User(),

    @Column(name = "date_created", updatable = false)
        var dateCreated: LocalDateTime = LocalDateTime.now(),

    @Column(name = "date_updated")
        var dateUpdated: LocalDateTime = LocalDateTime.now(),

    @ManyToMany(mappedBy = "groups")
        @JsonManagedReference // Indicates the parent side of the relationship
        var users: MutableList<User> = mutableListOf()


) {
        override fun toString(): String {
                return "Group(id=$id, name='$name')"
        }
}

