package hu.vissy.yasp.module.common

import java.time.LocalDate

data class FilterDateRangeDto(
    var from: LocalDate? = null,
    var to: LocalDate? = null
)
