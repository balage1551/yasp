package hu.vissy.yasp.entity

import java.io.Serializable


//@Entity
//@Table(name = "app_user")
open class AppUser(
    open var id: Long? = null,

//    @Column(name = "account_id", nullable = false)
    open var userName: String,

//    @Column(name = "email")
//    open var email: String? = null,
//
//    @Column(name = "first_name")
//    open var firstName: String? = null,
//
//    @Column(name = "surname")
//    open var surname: String? = null,
//
//    @Column(name = "nick_name")
//    open var nickname: String? = null,

//    @Column
    open var password: String? = null,

//    @Column(name = "forgotten_password_code")
//    open var forgottenPasswordCode: String? = null,

//    @Column(name = "is_using_2FA")
//    open val isUsing2FA: Boolean,
//
//    @Column(name = "secret_code_2FA")
//    open val secretCode2FA: String,

//    @ManyToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
//    @JoinTable(
//        name = "app_user_role",
//        joinColumns = [JoinColumn(name = "app_user_id")],
//        inverseJoinColumns = [JoinColumn(name = "role_id")]
//    )
//    open val roles: Set<Role> = emptySet()

) : Serializable {

//    @Id
//    @SequenceGenerator(name = "SEQ_USER_ID", sequenceName = "user_seq", allocationSize = 1)
//    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_USER_ID")

//
//    open val language get() = Language.HU


//    open val permissions: Array<String>
//        get() = permissionSet.map { it.name }.toTypedArray()
//
//    open val permissionSet: Set<Permission>
//        get() = roles.flatMap { it.permissions }.toSet()

    override fun toString(): String {
        return "User($userName)"
    }
}