package hu.vissy.yasp.module.user

data class UserBaseDataUpdateRequestDTO(
    val id: Long,
    val firstName: String,
    val surname: String,
    val nickname: String?,
    val email: String?
)
