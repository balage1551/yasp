package hu.vissy.yasp.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component
import java.security.interfaces.RSAPrivateKey
import java.security.interfaces.RSAPublicKey


@Component
@ConfigurationProperties(prefix = "rsa")
class RsaKeyConfigProperties {
    var publicKey: RSAPublicKey? = null
    var privateKey: RSAPrivateKey? = null
}