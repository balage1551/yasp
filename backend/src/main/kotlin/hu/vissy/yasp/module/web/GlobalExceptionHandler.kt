package hu.vissy.yasp.module.web

import hu.vissy.yasp.exceptions.FrontendMessageException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.servlet.mvc.support.DefaultHandlerExceptionResolver

@ControllerAdvice
class GlobalExceptionHandler : DefaultHandlerExceptionResolver() {
    @ExceptionHandler(FrontendMessageException::class)
    fun handleFrontendMessageException(exception: FrontendMessageException): ResponseEntity<String> {
        return ResponseEntity(exception.message, HttpStatus.UNPROCESSABLE_ENTITY)
    }
}