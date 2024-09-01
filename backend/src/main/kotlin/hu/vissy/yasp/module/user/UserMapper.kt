package hu.vissy.yasp.module.user

import hu.vissy.yasp.entity.AppUser
import org.mapstruct.Mapper
import org.mapstruct.factory.Mappers

@Mapper
interface IUserMapper {
    fun userToUserDto(user: AppUser): UserDTO

    fun toUserHeadDTO(user: AppUser): UserHeadDTO

}

val UserMapper: IUserMapper by lazy { Mappers.getMapper(IUserMapper::class.java) }


//object UserMapper : IUserMapper {
//    override fun userToUserDto(user: AppUser): UserDTO {
//        return UserDTO(
//            user.id ?: 0,
//            name = user.fullName,
//            email = user.email,
//            password = user.password,
//            firstName = user.firstName ?: "",
//            surname = user.surname ?: "",
//            roles = user.roles.map { RoleMapper.roleToRoleDTO(it) },
//            deleted = user.deleted
//        )
//    }
//
//    override fun userDtoToUser(dto: UserDTO): AppUser {
//        return AppUser(
//            surname = dto.surname,
//            firstName = dto.firstName,
//            email = dto.email,
//            roles = setOf(),
//            password = dto.password
//        ).apply {
//            this.id = dto.id
//        }
//    }
//
//    override fun updateUserFromUserDTO(dto: UserDTO, user: AppUser) {
//        user.surname = dto.surname
//        user.firstName = dto.firstName
//        user.email = dto.email
//        user.password = dto.password
//    }
//}
