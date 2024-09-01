package hu.vissy.yasp.exceptions

class FlywayMigrationError(message: String = "") : RuntimeException(message)

class UnauthorizedException(message: String) : RuntimeException(message)

class GeneralApplicationException(message: String) : RuntimeException(message)

class AuthenticationException(message: String) : RuntimeException(message)
