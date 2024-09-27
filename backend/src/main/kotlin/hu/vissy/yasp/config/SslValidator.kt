package hu.vissy.yasp.config

import mu.KLogging
import org.springframework.context.event.ContextRefreshedEvent
import org.springframework.context.event.EventListener
import org.springframework.core.env.ConfigurableEnvironment
import org.springframework.core.env.MapPropertySource
import org.springframework.stereotype.Component


@Component
class AppContextEventListener {

    private val printedKeys = setOf(
        "spring.ssl.bundle.jks.server.keystore.location",
        "spring.ssl.bundle.jks.server.key.alias",
        "server.port",
    )

    companion object : KLogging()

    @EventListener
    fun handleContextRefreshed(event: ContextRefreshedEvent) {
        printActiveProperties(event.applicationContext.environment as ConfigurableEnvironment)
    }

    fun printActiveProperties(env: ConfigurableEnvironment) {
        println("************************* ACTIVE APP PROPERTIES ******************************")
        env.propertySources
            .stream()
            .filter { ps -> ps is MapPropertySource }
            .map { ps -> (ps as MapPropertySource).source.keys }
            .flatMap { obj: Collection<*> -> obj.stream() }
            .distinct()
            .sorted()
            .filter { key -> key in printedKeys }
            .forEach { key -> println("$key=${env.getProperty(""+key)}") }
        println("******************************************************************************")
    }
}