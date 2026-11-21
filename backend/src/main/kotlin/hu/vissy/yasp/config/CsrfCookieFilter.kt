package hu.vissy.yasp.config

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.web.csrf.CsrfToken
import org.springframework.web.filter.OncePerRequestFilter

/**
 * Spring Security 6 loads the CSRF token lazily, so the cookie only appears once something reads
 * it: the first POST of a fresh browser (e.g. the first slide image) would go out without a token
 * and fail. Reading it here makes every response carry the cookie.
 */
class CsrfCookieFilter : OncePerRequestFilter() {
    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
        (request.getAttribute(CsrfToken::class.java.name) as CsrfToken?)?.token
        filterChain.doFilter(request, response)
    }
}
