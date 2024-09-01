package hu.vissy.yasp.editor

data class ScanRequestDTO (
    val path: String
)

data class ImageInfoDTO (
    val fileName: String
)

data class ScanResultDTO (
    val successful: Boolean,
    val images: List<ImageInfoDTO> = emptyList()
)
