package hu.vissy.yasp.module.user


data class UserHomeworkStateRequest(
    val userId: Long,
    val homeworkId: Long,
    val newState: String
)