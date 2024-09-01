package hu.vissy.yasp.module.auth.dto

data class LoginDTO(
    val account: String,
    val password: String,
//    val code: String?
)
