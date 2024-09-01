package hu.vissy.yasp.module.web

import hu.vissy.yasp.entity.AppUser
import jakarta.annotation.Resource
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.User
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor

@Component
open class UserInterceptor : HandlerInterceptor {
    @Resource
    lateinit var userRequestScopeWrapper: UserRequestScopeWrapper

    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any
    ): Boolean {
        userRequestScopeWrapper.user = null
        val authentication = SecurityContextHolder.getContext().authentication
        if (authentication == null || authentication.principal !is User) {
            response.status = HttpStatus.UNAUTHORIZED.value()
            return false
        }
        val securityUser = authentication.principal as User?
        if (securityUser == null) {
            response.status = HttpStatus.UNAUTHORIZED.value()
            return false
        }
        val accountId = securityUser.username
        // TODO
       // val user = userRepository.findByAccountId(accountId)
        val user = AppUser(0, "balage", "balage")
        if (user == null) {
            response.status = HttpStatus.UNAUTHORIZED.value()
            return false
        }
        userRequestScopeWrapper.user = user
        return true
    }
}
