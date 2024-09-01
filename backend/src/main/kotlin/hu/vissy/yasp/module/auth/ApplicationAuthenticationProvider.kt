package hu.vissy.yasp.module.auth

import hu.vissy.yasp.entity.AppUser
import org.slf4j.LoggerFactory
import org.springframework.http.HttpMethod
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate
import org.springframework.web.util.UriComponentsBuilder


@Component
class ApplicationAuthenticationProvider(
    val passwordEncoder: PasswordEncoder

) : AuthenticationProvider {

    private val log = LoggerFactory.getLogger(ApplicationAuthenticationProvider::class.java)


    @Throws(AuthenticationException::class)
    override fun authenticate(authentication: Authentication): Authentication? {
        val accountId = authentication.name
        val credentials = authentication.credentials as Map<String, String>
        val password = credentials["password"]!!
//        val code = credentials["code"]!!


        if (accountId.isBlank() || password.isBlank()) {
            log.error("Username or password is empty.")
            return null
        }
        // TODO
        val user = AppUser(0, "balage", password)
         if (passwordEncoder.matches(password, user.password)) {
            return UsernamePasswordAuthenticationToken(accountId, password, ArrayList<GrantedAuthority>())
        }
        return null
    }


    fun check2Fa(secret: String, code: String): Boolean {
        val uri = "https://www.authenticatorApi.com/Validate.aspx"
        val builder = UriComponentsBuilder.fromHttpUrl(uri)
        builder.queryParam("Pin", code)
        builder.queryParam("SecretCode", secret)
        val restTemplate = RestTemplate()
        val response: ResponseEntity<String> = restTemplate.exchange(
            builder.toUriString(),
            HttpMethod.GET,
            null,
            String::class.java
        )
        return response.body == "True"
    }


    override fun supports(authentication: Class<*>): Boolean {
        return authentication == UsernamePasswordAuthenticationToken::class.java
    }
}
