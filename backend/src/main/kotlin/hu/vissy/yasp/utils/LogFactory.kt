package hu.vissy.yasp.utils

import org.apache.logging.log4j.LogManager
import org.apache.logging.log4j.Logger
import kotlin.reflect.KProperty

class LogFactory {
    operator fun getValue(thisRef: Any?, property: KProperty<*>): Logger {
        requireNotNull(thisRef) { "No reference." }
        val name = if (thisRef::class.isCompanion) {
            thisRef::class.java.enclosingClass.simpleName
        } else {
            thisRef::class.java.simpleName
        }
        return LogManager.getLogger(name)
            ?: throw IllegalArgumentException("Can't create logger for ${thisRef::class.java}")
    }

    companion object {
        operator fun invoke(clazz: Class<*>): Logger = invoke(clazz.canonicalName)

        operator fun invoke(name: String): Logger {
            return LogManager.getLogger(name)
                ?: throw IllegalArgumentException("Can't create logger for $name")
        }

    }

}

