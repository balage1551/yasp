package hu.vissy.yasp.module.user

data class UserPasswordUpdateRequestDTO(
    val userId: Long,
    val password: String
)
