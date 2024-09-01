package hu.vissy.yasp.module.common

abstract class ListRequestDto(val page: Int, val itemsPerPage: Int, val sortBy: String, val sortDesc: Boolean)
