package hu.vissy.yasp.module.auth.dto

import hu.vissy.yasp.module.user.UserHeadDTO

class LoginResponseDTO(
    val token: String,
    val currentUser: UserHeadDTO
)
