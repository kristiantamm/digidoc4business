package com.d4b.sid

import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.boot.runApplication
import org.springframework.context.event.EventListener
import org.springframework.data.jpa.repository.config.EnableJpaRepositories


@SpringBootApplication
@EntityScan(basePackages = ["com.d4b.sid.model.db"])
@EnableJpaRepositories(basePackages = ["com.d4b.sid.repository"])
class App {
	@Value("\${server.port}")
	private val port: String? = null

	@EventListener(ApplicationReadyEvent::class)
	fun applicationReadyEvent() {
		println("Now open http://localhost:$port")
	}

	companion object {
		@JvmStatic
		fun main(args: Array<String>) {
			runApplication<App>(*args)
		}

	}
}
