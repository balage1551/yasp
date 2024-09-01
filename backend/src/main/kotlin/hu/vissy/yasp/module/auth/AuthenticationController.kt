package hu.vissy.yasp.module.auth

import hu.vissy.yasp.module.auth.dto.LoginDTO
import hu.vissy.yasp.module.auth.dto.LoginResponseDTO
import hu.vissy.yasp.module.web.BaseController
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController


@RequestMapping("/auth")
@RestController
class AuthenticationController(
    private val authenticationService: AuthenticationService,
) : BaseController() {

    private val log = LoggerFactory.getLogger(AuthenticationController::class.java)

    @PostMapping("/login")
    fun login(
        request: HttpServletRequest,
        @RequestBody @Validated loginDTO: LoginDTO
    ): ResponseEntity<LoginResponseDTO> {
        return try {
            log.info("User: {} {}", request.remoteAddr, request.getHeader("User-Agent"))
            ResponseEntity<LoginResponseDTO>(authenticationService.login(loginDTO), HttpStatus.OK)
        } catch (ex: AuthenticationException) {
            log.error(ex.message)
            log.debug("", ex)
            ResponseEntity<LoginResponseDTO>(HttpStatus.BAD_REQUEST)
        }
    }

//
//    @PostMapping("/register")
//    fun register(
//        @RequestBody @Validated registrationDTO: RegistrationDTO
//    ): ResponseEntity<RegistrationResponseDTO> {
//        return ResponseEntity(authenticationService.register(registrationDTO), HttpStatus.OK)
//    }
//

    @PostMapping("/logout")
    fun logout(): ResponseEntity<Void> {
        SecurityContextHolder.getContext().authentication = null
        return ResponseEntity<Void>(HttpStatus.OK)
    }

// TODO V6
//    @PostMapping("/forgotten")
//    fun forgottenPassword(@RequestBody @Validated forgottenPasswordDTO: ForgottenPasswordDTO): ResponseEntity<Any> {
//        return try {
//            authenticationService.forgottenPassword(forgottenPasswordDTO)
//            ResponseEntity<Any>(HttpStatus.OK)
//        } catch (mse: MessagingException) {
//            ResponseEntity<Any>(TextResponses.RESPONSE_MESSAGE_SENDING_UNAVAILABLE, HttpStatus.OK)
//        } catch (mse: TemplateException) {
//            ResponseEntity<Any>(TextResponses.RESPONSE_MESSAGE_SENDING_UNAVAILABLE, HttpStatus.OK)
//        } catch (mse: IOException) {
//            ResponseEntity<Any>(TextResponses.RESPONSE_MESSAGE_SENDING_UNAVAILABLE, HttpStatus.OK)
//        }
//    }
//
//    @GetMapping("/forgotten/{forgottenPasswordCode}")
//    fun checkForgottenPasswordCode(@PathVariable forgottenPasswordCode: String): ResponseEntity<Void> {
//        authenticationService.checkForgottenPasswordCode(forgottenPasswordCode)
//        return ResponseEntity<Void>(HttpStatus.OK)
//    }
//
//    @PostMapping("/new-password")
//    fun newPassword(@RequestBody @Validated newPasswordDTO: NewPasswordDTO): ResponseEntity<String> {
//        authenticationService.newPassword(newPasswordDTO)
//        return ResponseEntity<String>(HttpStatus.OK)
//    }
//
//    @PostMapping("/refresh")
//    fun refresh(@RequestHeader(value = "\${jwt.tokenHeader}") completeToken: String): ResponseEntity<JwtTokenValue> {
//        val jwtTokenValue: JwtTokenValue? =
//            authenticationService.refresh(completeToken, userRequestScopeWrapper.user!!)
//        return if (jwtTokenValue != null) {
//            ResponseEntity<JwtTokenValue>(jwtTokenValue, HttpStatus.OK)
//        } else ResponseEntity<JwtTokenValue>(HttpStatus.BAD_REQUEST)
//    }
}
