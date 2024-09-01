package hu.vissy.yasp.module.web

import hu.vissy.yasp.module.web.TextResponses.RESPONSE_FAILED
import hu.vissy.yasp.module.web.TextResponses.RESPONSE_NOT_FOUND
import hu.vissy.yasp.module.web.TextResponses.RESPONSE_SUCCESS
import hu.vissy.yasp.module.web.TextResponses.RESPONSE_UNAUTHORIZED
import jakarta.annotation.Resource
import org.springframework.http.HttpStatus

open class BaseController {
    @Resource
    protected lateinit var userRequestScopeWrapper: UserRequestScopeWrapper

    protected fun getHttpStatus(textResult: String) = when (textResult) {
        RESPONSE_SUCCESS -> HttpStatus.OK
        RESPONSE_NOT_FOUND -> HttpStatus.NOT_FOUND
        RESPONSE_UNAUTHORIZED -> HttpStatus.UNAUTHORIZED
        RESPONSE_FAILED -> HttpStatus.INTERNAL_SERVER_ERROR
        else -> HttpStatus.I_AM_A_TEAPOT

    }
}
