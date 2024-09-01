package hu.vissy.yasp

import hu.vissy.yasp.config.RsaKeyConfigProperties
import mu.KotlinLogging
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.builder.SpringApplicationBuilder
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer
import org.springframework.context.MessageSource
import org.springframework.context.annotation.Bean
import org.springframework.context.support.ReloadableResourceBundleMessageSource


@SpringBootApplication(scanBasePackageClasses = [BasePackageMarkerClass::class]) // FileStorePackageMarkerClass::class ])
@EnableConfigurationProperties(RsaKeyConfigProperties::class)
//@EnableScheduling
class YaspApplication: SpringBootServletInitializer() {
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



    private val log = KotlinLogging.logger {}
}

fun main(args: Array<String>) {
    SpringApplication.run(YaspApplication::class.java, *args)
}

