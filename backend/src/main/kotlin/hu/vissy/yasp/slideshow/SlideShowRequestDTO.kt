package hu.vissy.yasp.slideshow

data class SlideShowListItemDTO (
    val name: String
)

data class SlideShowListResponseDTO (
    val path: String,
    val slideShows: List<SlideShowListItemDTO>
)


data class SlideShowRequestDTO (
    val path: String,
    val name: String
)
