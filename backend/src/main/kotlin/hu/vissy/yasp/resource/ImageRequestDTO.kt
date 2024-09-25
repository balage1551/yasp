package hu.vissy.yasp.resource

data class ImageRequestDTO (
    val fileName: String,
    val width: Int? = 120,
    val height: Int? = 80
)
