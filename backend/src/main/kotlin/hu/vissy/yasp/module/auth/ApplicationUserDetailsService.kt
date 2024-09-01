package hu.vissy.yasp.module.auth

import hu.vissy.yasp.entity.AppUser
import mu.KotlinLogging
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import org.springframework.security.core.userdetails.User as SpringUser


@Service
class ApplicationUserDetailsService : UserDetailsService {

    @Throws(UsernameNotFoundException::class)
    override fun loadUserByUsername(accountId: String): UserDetails {
        val user: AppUser = AppUser(0, "balage", "balage")
        val logger = KotlinLogging.logger {  }
        logger.info("user: ${user.userName}, ${user.password}")
        val userDetails: UserDetails = SpringUser.withUsername(user.userName)
            .password(user.password)
            //.authorities(*user.permissions)
            .build()
        return UserDetailsWithUser(userDetails, user)
    }
}
