package hu.vissy.yasp.module.auth

import hu.vissy.yasp.entity.AppUser
import hu.vissy.yasp.module.auth.dto.LoginDTO
import hu.vissy.yasp.module.auth.dto.LoginResponseDTO
import hu.vissy.yasp.module.user.UserMapper
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.oauth2.jwt.JwtClaimsSet
import org.springframework.security.oauth2.jwt.JwtEncoder
import org.springframework.security.oauth2.jwt.JwtEncoderParameters
import org.springframework.stereotype.Service
import java.time.Instant
import java.time.temporal.ChronoUnit


@Service
class AuthenticationService(
    private val jwtEncoder: JwtEncoder,
    private val authenticationManager: AuthenticationManager,
    private val passwordEncoder: PasswordEncoder
) {

    fun login(loginDTO: LoginDTO): LoginResponseDTO {
        log.info("Login attempt :{}", loginDTO)
        val authentication: Authentication = authenticationManager
            .authenticate(
                UsernamePasswordAuthenticationToken(
                    loginDTO.account,
                    loginDTO.password
                )
            )
        SecurityContextHolder.getContext().authentication = authentication
        log.info("Token requested for user :{}", authentication.authorities)
        val token = generateToken(authentication)

        val user: AppUser = AppUser(0, "balage", "balage")
        return LoginResponseDTO(
            token,
            UserMapper.toUserHeadDTO(user)
        )
    }

//    fun register(registrationDTO: RegistrationDTO) : RegistrationResponseDTO {
//        val user = appUserRepository.findByAccountId(registrationDTO.accountName)
//        if (user != null) {
//            return RegistrationResponseDTO(false, "existingUser")
//        }
//        val encodedPassword = passwordEncoder.encode(registrationDTO.password)
//        val newUser = AppUser(
//            accountId = registrationDTO.accountName,
//            firstName = registrationDTO.firstName,
//            surname = registrationDTO.surname,
//            nickname = if (registrationDTO.nickname.isNullOrBlank()) null else registrationDTO.nickname,
//            password = encodedPassword,
//            email = if (registrationDTO.email.isNullOrBlank()) null else registrationDTO.email,
//            roles = setOf(roleRepository.findByName("STUDENT")!!)
//        )
//        appUserRepository.save(newUser)
//        return RegistrationResponseDTO(true)
//    }

    fun generateToken(authentication: Authentication): String {
        val now = Instant.now()
        val scope = authentication.authorities.joinToString(" ") { obj: GrantedAuthority ->
            obj.authority
        }
        val claims = JwtClaimsSet.builder()
            .issuer("self")
            .issuedAt(now)
            .expiresAt(now.plus(10, ChronoUnit.HOURS))
            .subject(authentication.name)
            .claim("scope", scope)
            .build()
        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).tokenValue
    }

    companion object {
        private val log = LoggerFactory.getLogger(AuthenticationService::class.java)
    }
}