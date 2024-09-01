package hu.vissy.yasp.module.auth

import hu.vissy.yasp.entity.AppUser
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.User as SpringUser


class UserDetailsWithUser(userDetails: UserDetails, val user: AppUser) :
    SpringUser(userDetails.username, userDetails.password, userDetails.authorities)
