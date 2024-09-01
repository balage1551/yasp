package hu.vissy.yasp.config

import hu.vissy.yasp.module.web.UserRequestScopeWrapper
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.annotation.AsyncConfigurer
import org.springframework.scheduling.annotation.EnableAsync
import org.springframework.web.context.annotation.RequestScope

@Configuration
@EnableAsync
class YaspConfiguration : AsyncConfigurer {

    @Bean
    @RequestScope
    fun userRequestScopeWrapper(): UserRequestScopeWrapper {
        return UserRequestScopeWrapper()
    }
}
