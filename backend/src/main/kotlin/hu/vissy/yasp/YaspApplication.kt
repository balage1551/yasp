package hu.vissy.yasp

import hu.vissy.yasp.config.RsaKeyConfigProperties
import kotlinx.cli.ArgParser
import kotlinx.cli.ArgType
import kotlinx.cli.default
import kotlinx.cli.optional
import mu.KotlinLogging
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.builder.SpringApplicationBuilder
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer
import org.springframework.context.MessageSource
import org.springframework.context.annotation.Bean
import org.springframework.context.event.EventListener
import org.springframework.context.support.ReloadableResourceBundleMessageSource
import java.awt.Desktop
import java.io.IOException
import java.net.URI


@SpringBootApplication(scanBasePackageClasses = [BasePackageMarkerClass::class]) // FileStorePackageMarkerClass::class ])
@EnableConfigurationProperties(RsaKeyConfigProperties::class)
//@EnableScheduling
class YaspApplication : SpringBootServletInitializer() {
    override fun configure(application: SpringApplicationBuilder): SpringApplicationBuilder {
        return application.sources(YaspApplication::class.java)
    }

    @Bean
    fun messageSource(): MessageSource {
        val messageSource = ReloadableResourceBundleMessageSource()
        messageSource.setBasename("/WEB-INF/classes/Messages")
        messageSource.setDefaultEncoding("UTF-8")
        return messageSource
    }


    @EventListener(ApplicationReadyEvent::class)
    fun openAppInBrowser() {
        if (arguments.doNotOpenBrowser) {
            return
        }
        val url = "http://localhost:9811/"
        log.info { "Opening app in browser: $url" }
        if (Desktop.isDesktopSupported()) {
            val desktop = Desktop.getDesktop()
            if (desktop.isSupported(Desktop.Action.BROWSE)) {
                desktop.browse(URI(url))
            } else {
                log.error("BROWSE action is not supported on your platform.")
            }
        } else {
            log.error("Desktop is not supported on your platform.")
            val runtime = Runtime.getRuntime()
            try {
                runtime.exec("xdg-open $url")
            } catch (e: IOException) {
                e.printStackTrace()
            }
        }
    }

    private val log = KotlinLogging.logger {}
}


fun main(args: Array<String>) {
    val parser = ArgParser("yasp")
    val directory by parser.argument(ArgType.String, description = "Root directory of the slideshow").optional().default(".")
    val doNotOpenBrowser by parser.option(ArgType.Boolean, fullName = "no-browser", description = "Do not open app in browser").default(false)
    parser.parse(args)

    arguments = Arguments(
        path = directory,
        doNotOpenBrowser = doNotOpenBrowser,
    )

    SpringApplication.run(YaspApplication::class.java, *args)

}

