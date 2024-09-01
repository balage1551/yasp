package hu.vissy.yasp.module.auth.dto

data class RegistrationDTO(
    val accountName: String,
    val firstName: String,
    val surname: String,
    val nickname: String? = null,
    val email: String? = null,
    val password: String
)