package hu.vissy.yasp.entity

//
//@MappedSuperclass
//abstract class BaseEntity : EntityWithId() {
//
//    @Column(name = "create_date", columnDefinition = "TIMESTAMP")
//    open var createDate: LocalDateTime? = null
//
//    @Column(name = "update_date", columnDefinition = "TIMESTAMP")
//    open var updateDate: LocalDateTime? = null
//
////    @ManyToOne(fetch = FetchType.LAZY)
////    @JoinColumn(name = "creator_id")
////    open var creator: User? = null
////
////    @ManyToOne(fetch = FetchType.LAZY)
////    @JoinColumn(name = "updater_id")
////    open var updater: User? = null
//
//    @PrePersist
//    private fun prePersist() {
//        updateDate = LocalDateTime.now()
//        createDate = updateDate
////        creator = currentUser
//    }
//
//    @PreUpdate
//    private fun preUpdate() {
//        updateDate = LocalDateTime.now()
////        updater = currentUser
//    }
//
////    private val currentUser: User?
////        get() {
////            var user: User? = null
////            if (needsAuthentication) {
////                val principal = SecurityContextHolder.getContext().authentication.principal
////                if (principal is UserDetailsWithUser) {
////                    user = principal.user
////                    updater = user
////                }
////            }
////            return user
////        }
//
//    override fun toString(): String {
//        return String.format("Entity: %d - %s", id, javaClass.name)
//    }
//
//    override fun equals(other: Any?): Boolean {
//        if (this === other) {
//            return true
//        }
//        if (other == null || Hibernate.getClass(this) != Hibernate.getClass(other)) {
//            return false
//        }
//        val that = other as BaseEntity
//        return id == that.id
//    }
//
//    override fun hashCode(): Int {
//        return Objects.hash(id, createDate)
//    }
//
////    @Transient
////    open val needsAuthentication : Boolean = true
//}
