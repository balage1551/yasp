package hu.vissy.yasp.module.common

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class LinkService {
    @Value("\${homeworkmole.public-url}")
    private val publicUrl: String? = null

//    fun getNewPasswordLink(user: User, language: Language): String {
//        return publicUrl + "password/" + user.forgottenPasswordCode + "/" + language
//    }
}
