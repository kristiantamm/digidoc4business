plugins {
	kotlin("jvm") version "1.9.25"
	kotlin("plugin.spring") version "1.9.25"
	id("org.springframework.boot") version "3.3.4"
	id("io.spring.dependency-management") version "1.1.6"
	id("nu.studer.jooq") version "8.2"
}

group = "com.example"
version = "0.0.1-SNAPSHOT"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(21)
	}
}

repositories {
	mavenCentral()
	maven { url = uri("https://repository.jboss.org/nexus/content/repositories/releases/") }
}

dependencies {

	implementation("org.springframework.boot:spring-boot-starter")
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("org.jetbrains.kotlin:kotlin-reflect")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
	implementation("ee.sk.smartid:smart-id-java-client:2.3")
	implementation("org.springframework.boot:spring-boot-starter-mail")
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
	implementation("javax.validation:validation-api:2.0.1.Final")
	implementation("org.hibernate.validator:hibernate-validator:6.0.13.Final")
	implementation(kotlin("stdlib-jdk8"))
	implementation("org.digidoc4j:digidoc4j:5.0.0")// Gradle
	implementation("org.glassfish.jersey.core:jersey-client:3.1.0")
	implementation("org.glassfish.jersey.inject:jersey-hk2:3.1.0")
	implementation("org.springframework:spring-mock:2.0.8")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	implementation("org.postgresql:postgresql:42.5.0")
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("javax.xml.bind:jaxb-api:2.3.1")       // JAXB API
	implementation("org.glassfish.jaxb:jaxb-runtime:2.3.1") // JAXB Runtime



	// JOOQ dependencies
	implementation("org.springframework.boot:spring-boot-starter-jooq")

}
kotlin {
	compilerOptions {
		freeCompilerArgs.addAll("-Xjsr305=strict")
	}
}

jooq {
	version.set("3.18.5") // Use the latest JOOQ version compatible with your setup
	configurations {
		create("main") {
			generateSchemaSourceOnCompilation.set(false)
			jooqConfiguration.apply {
				logging = org.jooq.meta.jaxb.Logging.WARN
				jdbc.apply {
					driver = "org.postgresql.Driver"
					url = "jdbc:postgresql://localhost:5432/digidoc4business"
					user = "postgres"
					password = "1234"
				}
				generator.apply {
					name = "org.jooq.codegen.DefaultGenerator"
					database.apply {
						name = "org.jooq.meta.postgres.PostgresDatabase"
						inputSchema = "public"
					}
					generate.apply {
						isDeprecated = false
						isRecords = true
						isImmutablePojos = false
						isFluentSetters = true
					}
					target.apply {
						packageName = "com.example.jooq"
						directory = "$buildDir/generated-src/jooq/main"
					}
				}
			}
		}
	}
}

sourceSets {
	main {
		java {
			srcDir("$buildDir/generated-src/jooq/main")
		}
	}
}


tasks.withType<Test> {
	useJUnitPlatform()
}
tasks.withType<Jar>() {

    duplicatesStrategy = DuplicatesStrategy.EXCLUDE

    manifest {
        attributes["Main-Class"] = "MainKt"
    }

    configurations["compileClasspath"].forEach { file: File ->
        from(zipTree(file.absoluteFile))
    }
}

tasks.register("startPostgres") {
	doLast {
		exec {
			commandLine("docker", "compose", "up", "-d")
		}
	}
}

tasks.register("stopPostgres") {
	doLast {
		exec {
			commandLine("docker", "compose", "down")
		}
	}
}