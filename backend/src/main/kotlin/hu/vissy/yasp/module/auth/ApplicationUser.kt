package hu.vissy.yasp.module.auth

import hu.vissy.yasp.entity.AppUser
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails

class ApplicationUser(user: AppUser) : UserDetails {
    private val user: AppUser

    init {
        this.user = user
    }

    override fun getAuthorities() = emptyList<GrantedAuthority>()
    override fun getPassword() = user.password
    override fun getUsername() = user.userName
    override fun isAccountNonExpired() = false
    override fun isAccountNonLocked() = false
    override fun isCredentialsNonExpired() = false
    override fun isEnabled() = false
}
