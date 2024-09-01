package hu.vissy.yasp.module.common

import org.springframework.core.convert.converter.Converter
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.time.format.DateTimeFormatter


@Component
class LocalDateConverter : Converter<String, LocalDate?> {
    override fun convert(source: String): LocalDate? {
        return LocalDate.parse(source, DATE_TIME_FORMATTER)
    }

    companion object {
        private val DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd")
    }
}