package hu.vissy.yasp.module.user

data class ChangePasswordDTO(
    val password: String,
    val currentPassword: String
)
