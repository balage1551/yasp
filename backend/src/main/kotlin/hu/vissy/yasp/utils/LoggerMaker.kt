package hu.vissy.yasp.utils

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import kotlin.reflect.KProperty

class LoggerMaker {
    operator fun getValue(thisRef: Any?, property: KProperty<*>): Logger {
        requireNotNull(thisRef) { "No reference." }
        val name = if (thisRef::class.isCompanion) {
            thisRef::class.java.enclosingClass.simpleName
        } else {
            thisRef::class.java.simpleName
        }
        return LoggerFactory.getLogger(name)
            ?: throw IllegalArgumentException("Can't create logger for ${thisRef::class.java}")
    }

    companion object {
        operator fun invoke(clazz: Class<*>): Logger = invoke(clazz.canonicalName)

        operator fun invoke(name: String): Logger {
            return LoggerFactory.getLogger(name)
                ?: throw IllegalArgumentException("Can't create logger for $name")
        }

    }

}

