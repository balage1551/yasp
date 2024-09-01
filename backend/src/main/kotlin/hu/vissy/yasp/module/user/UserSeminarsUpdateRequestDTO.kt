package hu.vissy.yasp.module.user

data class UserSeminarsUpdateRequestDTO(
    val userId: Long,
    val seminarIds: List<Long>
)
