package hu.vissy.yasp.module.auth.dto

data class RegistrationResponseDTO(
    val success: Boolean,
    val errorCode: String? = null
)