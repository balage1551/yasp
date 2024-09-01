package hu.vissy.yasp.entity

//
//@MappedSuperclass
//abstract class EntityWithId : HasId {
//    // Note: Én a per tábla sequence-t preferálom, ezért csak a vég
//    // entitáson kell/szabad ID-t generálni.
////    @Id
////    @SequenceGenerator(name = "SEQ_GENERATOR_ID", sequenceName = "homeworkmole_seq", allocationSize = 1)
////    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_GENERATOR_ID")
////    override var id: Long? = null
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
//        val that = other as EntityWithId
//        return id == that.id
//    }
//
//    override fun hashCode(): Int {
//        return Objects.hash(id)
//    }
//}
