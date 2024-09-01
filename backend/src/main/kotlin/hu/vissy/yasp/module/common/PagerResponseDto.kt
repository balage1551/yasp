package hu.vissy.yasp.module.common

data class PagerResponseDto<T>(val data: List<T>,val itemsLength: Long)
