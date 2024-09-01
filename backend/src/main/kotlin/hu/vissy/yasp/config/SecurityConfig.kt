package hu.vissy.yasp.config

import com.nimbusds.jose.jwk.JWK
import com.nimbusds.jose.jwk.JWKSet
import com.nimbusds.jose.jwk.RSAKey
import com.nimbusds.jose.jwk.source.ImmutableJWKSet
import hu.vissy.yasp.module.auth.ApplicationUserDetailsService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.ProviderManager
import org.springframework.security.authentication.dao.DaoAuthenticationProvider
import org.springframework.security.config.Customizer
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configurers.SessionManagementConfigurer
import org.springframework.security.config.annotation.web.configurers.oauth2.server.resource.OAuth2ResourceServerConfigurer
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtEncoder
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.csrf.CookieCsrfTokenRepository
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler
import org.springframework.security.web.csrf.XorCsrfTokenRequestAttributeHandler
import org.springframework.security.web.servlet.util.matcher.MvcRequestMatcher
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.web.servlet.handler.HandlerMappingIntrospector


@Configuration
@EnableWebSecurity
@EnableMethodSecurity
class SecurityConfig(
    private val rsaKeyConfigProperties: RsaKeyConfigProperties,
    private val userDetailsService: ApplicationUserDetailsService
) {
    @Value("\${application.allowed-origins}")
    private lateinit var allowedOrigins: Array<String>

    @Bean
    fun authManager(): AuthenticationManager {
        val authProvider = DaoAuthenticationProvider()
        authProvider.setUserDetailsService(userDetailsService)
        authProvider.setPasswordEncoder(passwordEncoder())
        return ProviderManager(authProvider)
    }

    @Bean
    fun mvc(introspector: HandlerMappingIntrospector): MvcRequestMatcher.Builder {
        return MvcRequestMatcher.Builder(introspector)
    }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        log.info("CORS allowed origins: ${allowedOrigins.joinToString()}")
        val config = CorsConfiguration()
        config.allowCredentials = true
        config.allowedOrigins = listOf(*allowedOrigins)
        config.allowedMethods = listOf("*")
        config.allowedHeaders = listOf(
            AUTHORIZATION_HEADER,
            CONTENT_TYPE_HEADER,
            X_AUTH_TOKEN_HEADER,
            X_XSRF_TOKEN
        )
        config.exposedHeaders = listOf(X_AUTH_TOKEN_HEADER)
        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", config)
        return source
    }

    @Bean
    fun filterChain(http: HttpSecurity, mvc: MvcRequestMatcher.Builder): SecurityFilterChain {
        return http
            .headers { headers ->
                headers.cacheControl(Customizer.withDefaults())
            }
            .csrf {
                it.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                it.csrfTokenRequestHandler(XorCsrfTokenRequestAttributeHandler())
                it.csrfTokenRequestHandler(CsrfTokenRequestAttributeHandler())
            }
            .cors { }
            .authorizeHttpRequests { registry ->
                // TODO: migrate
                registry.requestMatchers(mvc.pattern(HttpMethod.OPTIONS, "/**")).permitAll()
                // Static contents
                registry.requestMatchers(mvc.pattern("/*")).permitAll()
                registry.requestMatchers(mvc.pattern("/common.css")).permitAll()
                registry.requestMatchers(mvc.pattern("/favicon.png")).permitAll()
                registry.requestMatchers(mvc.pattern("/index.html")).permitAll()
                registry.requestMatchers(mvc.pattern("/assets/**")).permitAll()
                registry.requestMatchers(mvc.pattern("/flags/**")).permitAll()
                // Internal
                // API
                registry.requestMatchers(mvc.pattern("/resource/**")).permitAll()
                registry.anyRequest().permitAll()
            }
            .sessionManagement { s: SessionManagementConfigurer<HttpSecurity> ->
                s.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            }
            .oauth2ResourceServer { oauth2: OAuth2ResourceServerConfigurer<HttpSecurity> ->
                oauth2.jwt { jwt ->
                    jwt.decoder(
                        jwtDecoder()
                    )
                }
            }
            .userDetailsService(userDetailsService)
            .httpBasic(Customizer.withDefaults())
            .build()
    }

    @Bean
    fun jwtDecoder(): JwtDecoder {
        return NimbusJwtDecoder.withPublicKey(rsaKeyConfigProperties.publicKey).build()
    }

    @Bean
    fun jwtEncoder(): JwtEncoder {
        val jwk: JWK = RSAKey.Builder(rsaKeyConfigProperties.publicKey).privateKey(
            rsaKeyConfigProperties.privateKey
        ).build()
        return NimbusJwtEncoder(ImmutableJWKSet(JWKSet(jwk)))
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder(BCryptPasswordEncoder.BCryptVersion.`$2B`, 10)
    }

    companion object {
        private val log = LoggerFactory.getLogger(SecurityConfig::class.java)

        private const val AUTHORIZATION_HEADER = "authorization"
        private const val CONTENT_TYPE_HEADER = "content-type"
        private const val X_AUTH_TOKEN_HEADER = "x-auth-token"
        private const val X_XSRF_TOKEN = "x-xsrf-token"
    }
}