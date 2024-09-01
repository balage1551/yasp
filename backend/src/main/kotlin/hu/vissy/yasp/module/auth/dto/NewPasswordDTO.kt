package hu.vissy.yasp.module.auth.dto

data class NewPasswordDTO(
    val forgottenPasswordCode: String,
    val password: String
)
