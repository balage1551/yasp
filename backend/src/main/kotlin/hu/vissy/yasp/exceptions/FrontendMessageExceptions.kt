package hu.vissy.yasp.exceptions


open class FrontendMessageException(message: String) : RuntimeException(message)

class ResourceDeleteException() : FrontendMessageException("error.elementCannotBeDeleted")

