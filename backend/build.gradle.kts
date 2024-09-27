//import com.github.monosoul.markdown.page.generator.gradle.plugin.GenerateHtmlTask
//import org.hidetake.groovy.ssh.core.Remote
//import org.hidetake.groovy.ssh.core.RunHandler
//import org.hidetake.groovy.ssh.session.SessionHandler
import com.github.gradle.node.npm.task.NpmTask
import org.hidetake.groovy.ssh.core.Remote
import org.hidetake.groovy.ssh.core.RunHandler
import org.hidetake.groovy.ssh.session.SessionHandler
import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import java.io.FileInputStream
import java.util.*

plugins {
    id("org.springframework.boot") version "3.1.5"
    id("io.spring.dependency-management") version "1.1.3"
    kotlin("jvm") version "2.0.20"
    kotlin("plugin.spring") version "2.0.20"
//    kotlin("plugin.jpa") version "2.0.20"
    kotlin("kapt") version "2.0.20"
    id("com.github.node-gradle.node") version "7.0.1"
    id("war")
    id("org.hidetake.ssh") version "2.11.2"
//    id("com.github.monosoul.markdown.page.generator") version "2.4.0.0"
    application
}

group = "hu.vissy.yasp"
version = "0.0.1-SNAPSHOT"



java.sourceCompatibility = JavaVersion.VERSION_17

repositories {
    mavenCentral()
}


dependencies {
    implementation("org.junit.jupiter:junit-jupiter:5.8.1")

    implementation("org.springframework.boot:spring-boot-starter")
//    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-web")
    providedRuntime("org.springframework.boot:spring-boot-starter-tomcat")

//    implementation("org.springframework.boot:spring-boot-starter-mail")
//    implementation("org.springframework.boot:spring-boot-starter-freemarker")

//    implementation("org.postgresql:postgresql:42.7.2")

    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    kotlin("reflect")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")

    implementation("io.github.microutils:kotlin-logging-jvm:3.0.5")

    implementation("io.jsonwebtoken:jjwt-api:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-gson:0.11.5")

    api("com.google.code.gson:gson:2.10.1")
    implementation("org.apache.commons:commons-csv:1.10.0")
    api("com.google.guava:guava:33.2.1-jre")

    implementation("org.mapstruct:mapstruct:1.5.5.Final")
    kapt("org.mapstruct:mapstruct-processor:1.5.5.Final")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation(kotlin("test"))

    testImplementation("org.junit.jupiter:junit-jupiter-api:5.8.1")
    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine:5.8.1")

    kapt("com.querydsl:querydsl-apt:5.0.0:jakarta")
    implementation("com.querydsl:querydsl-jpa:5.0.0")

//    implementation("com.vladsch.flexmark:flexmark-all:0.64.8")

//    implementation("org.flywaydb:flyway-core")

    implementation("org.jetbrains.kotlinx:kotlinx-cli:0.3.6")
}

val frontendDir = rootDir.resolve("frontend")
val frontendDistDir = frontendDir.resolve("dist")

node {
    version.set("18.18.0")
    nodeProjectDir.set(frontendDir)
}

kotlin {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_17)
    }
}

application {
    applicationDefaultJvmArgs = listOf("-Dspring.profiles.active=prod")
}

val credentials = Properties().apply {
    load(FileInputStream(projectDir.resolve(".server")))
}

class SslParams(properties: Properties, prefix: String) {
    var keyAlias: String? = null
    var keyStoreLocation: String? = null
    var keyStorePassword: String? = null
    var keyStoreType: String? = null

    init {
        keyAlias = properties.getProperty("$prefix.keyAlias")
        keyStoreLocation = properties.getProperty("$prefix.keyStoreLocation")
        keyStorePassword = properties.getProperty("$prefix.keyStorePassword")
        keyStoreType = properties.getProperty("$prefix.keyStoreType")
    }

    fun toMap(): Map<String, String> {
        return mapOf(
            "keyAlias" to keyAlias!!,
            "keyStoreLocation" to keyStoreLocation!!,
            "keyStorePassword" to keyStorePassword!!,
            "keyStoreType" to keyStoreType!!
        )
    }

}

val host = credentials.getProperty("host")
val user = credentials.getProperty("user")
val password = credentials.getProperty("password")

tasks {

    @Suppress("UnstableApiUsage")
    withType<ProcessResources> {
        filesMatching("**/application-local.yaml") {
            expand(SslParams(credentials, "local").toMap())
        }
        filesMatching("**/application-prod.yaml") {
            expand(SslParams(credentials, "prod").toMap())
        }
    }

    val npmCheckInstall by registering(NpmTask::class) {
        args.add("install")
    }

    val npmBuild by registering(NpmTask::class) {
        dependsOn(npmCheckInstall)
        args.addAll("run", "build-prod")
    }

    withType<Test> {
        useJUnitPlatform()
    }


    named<War>("bootWar") {
        dependsOn(npmBuild)

        into("") {
            from(frontendDistDir)
        }

        archiveFileName.set("yasp.war")
    }

    val docMdSourceDir = rootDir.resolve("tools/doc")
    val docHtmlOutputDir = project.layout.buildDirectory.dir("html").get().asFile

    val copyDocAssets = register("copyDocumentationAssets") {
        group = "documentation"

        doLast {
            project.copy {
                from(docMdSourceDir.resolve("assets")) {
                    include("*")
                }
                into(docHtmlOutputDir.resolve("assets"))
            }
            project.copy {
                from(docMdSourceDir.resolve("default.css"))
                into(docHtmlOutputDir)
            }
        }
    }

//
//    val generateDocHtml = named<GenerateHtmlTask>("generateHtml") {
//        dependsOn(processResources)
//
//        val encoding = "UTF-8"
//
//        recursiveInput.set(true)
//        pegdownExtensions.set("TABLES,FENCED_CODE_BLOCKS")
//        inputEncoding.set(encoding)
//        outputEncoding.set(encoding)
//
//
//        inputDirectory.set(docMdSourceDir)
//        outputDirectory.set(docHtmlOutputDir)
//        headerHtmlFile.set(docMdSourceDir.resolve("header.html"))
//        footerHtmlFile.set(docMdSourceDir.resolve("footer.html"))
//
//        transformRelativeMarkdownLinks.set(true)
//
//        // Configure copyaspets task to copy assets directory and default.css
//
//        dependsOn(copyDocAssets)
//    }

    val deploy = create(name = "deployToServer") {
        dependsOn(named("bootDistZip")) //, generateDocHtml)

        group = "deploy"

        val pi2 = Remote(
            mapOf<String, String>(
                "host" to host,
                "user" to user,
                "password" to password
            )
        )

        doLast {
            ssh.run(delegateClosureOf<RunHandler> {
                session(pi2, delegateClosureOf<SessionHandler> {
                    put(
                        hashMapOf(
                            "from" to getByName<Zip>("bootDistZip").archiveFile.get().asFile,
                            "into" to "/home/balage/yasp/release"
                        )
                    )
                    execute("/home/balage/yasp/install.sh")
                })
            })
        }
    }
}


