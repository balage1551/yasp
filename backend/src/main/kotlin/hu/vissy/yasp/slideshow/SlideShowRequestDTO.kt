package hu.vissy.yasp.slideshow

import com.fasterxml.jackson.databind.JsonNode

data class SlideShowListItemDTO (
    val name: String
)

data class SlideShowListResponseDTO (
    val path: String,
    val editable: Boolean,
    val locked: Boolean,
    val slideShows: List<SlideShowListItemDTO>
)


data class SlideShowRequestDTO (
    val path: String,
    val name: String
)

data class SlideShowDeleteDTO (
    val path: String,
    val name: String
)


data class SlideShowSaveRequestDTO (
    val path: String,
    val name: String,
    val originalName: String,
    val data: JsonNode
)
