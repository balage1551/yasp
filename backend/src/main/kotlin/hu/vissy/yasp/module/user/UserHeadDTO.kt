package hu.vissy.yasp.module.user

class UserHeadDTO(
    val id: Long,
    val accountId: String,
    val fullName: String,
    val shortName: String,
    val firstName: String,
    val nickname: String?,
    val surname: String? = null,
    val email: String? = null
)
