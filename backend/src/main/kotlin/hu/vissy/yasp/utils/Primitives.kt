@file:Suppress("unused")

package hu.vissy.yasp.utils

import com.google.common.base.CaseFormat
import com.google.common.io.Resources
import com.google.gson.JsonElement
import com.google.gson.JsonParser
import java.io.ByteArrayOutputStream
import java.io.IOException
import java.io.PrintWriter
import java.io.StringWriter
import java.math.BigDecimal
import java.nio.charset.StandardCharsets
import java.nio.file.FileVisitResult
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.SimpleFileVisitor
import java.nio.file.attribute.BasicFileAttributes
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import java.util.*
import java.util.zip.CRC32
import java.util.zip.Checksum
import java.util.zip.GZIPInputStream
import java.util.zip.GZIPOutputStream
import kotlin.math.abs
import kotlin.math.absoluteValue
import kotlin.math.max
import kotlin.math.min
import kotlin.random.Random
import kotlin.text.Charsets.UTF_8


// ***************************************
// ** MATH
// ***************************************

infix fun Int.umod(other: Int): Int {
    var r = this % other
    if (r < 0) r += other
    return r
}

fun randomSign() = (0..1).random() * 2 - 1


private var haveNextNextGaussian = false
private var nextNextGaussian = 0.0

/**
 * Strangely, this function is not part of the Kotlin Random class. Source has been taken from the Java source
 */
fun Random.nextGaussian(): Double { // See Knuth, ACP, Section 3.4.1 Algorithm C.
    return if (haveNextNextGaussian) {
        haveNextNextGaussian = false
        nextNextGaussian
    } else {
        var v1: Double
        var v2: Double
        var s: Double
        do {
            v1 = 2 * nextDouble() - 1 // between -1 and 1
            v2 = 2 * nextDouble() - 1 // between -1 and 1
            s = v1 * v1 + v2 * v2
        } while (s >= 1 || s == 0.0)
        val multiplier = StrictMath.sqrt(-2 * StrictMath.log(s) / s)
        nextNextGaussian = v2 * multiplier
        haveNextNextGaussian = true
        v1 * multiplier
    }
}

fun pow2(v: Int): Int {
    return (1 shl v)
}


// ***************************************
// ** GENERAL
// ***************************************


@Suppress("NOTHING_TO_INLINE")
inline fun nop() {
}

/**
 * If the value of [this] is not null, applies the [op] on it.
 */
fun <T> T?.whenNotNull(op: (T) -> Unit) {
    if (this != null) op(this)
}


/**
 * If the value of [this] is null, returns null. Otherwise applies the [op] on it and returns the result.
 */
fun <T, U> T?.whenPresent(op: (T) -> U?): U? {
    return if (this != null) op(this) else null
}

/**
 * Returns true when all [items] are equals.
 */
fun <T> same(vararg items: T?): Boolean {
    (1 until items.size).forEach {
        if (items[it] != items[it - 1]) return false
    }
    return true
}

/**
 * Executes the [action] on [this] then returns [this]
 */
operator fun <T> T.invoke(action: T.() -> Unit): T = apply(action)


fun inside(start: Int, end: Int) = (start + 1 until end)


inline fun <reified T : Any?, R : Any> Any?.whenInstance(noinline op: T.() -> R): R? =
    if (this != null && this is T) op() else null

inline fun <reified T : Any?> Any?.whenInstance(noinline op: T.() -> Unit) {
    if (this != null && this is T) op()
}


// ***************************************
// ** RESOURCES
// ***************************************

@Suppress("UnstableApiUsage")
fun loadFromResource(resourceName: String): String =
    Resources.toString(Resources.getResource(resourceName), StandardCharsets.UTF_8)

// ***************************************
// ** EXCEPTIONS
// ***************************************

val Exception.callStackAsString: String
    get() {
        return with(StringWriter()) {
            this@callStackAsString.printStackTrace(PrintWriter(this))
            this.toString()
        }
    }


// ***************************************
// ** NUMBERS
// ***************************************

/**
 * Creates a range from [this] to [end], regardless the relation between the two.
 * (For example, 5.rangeTo(2) will return the range 2..5)
 */
fun Int.realRangeTo(end: Int) = if (this < end) this..end else end..this

/**
 * Repeats the [op] block [this] times.
 */
fun Int.repeatIndexed(op: (Int) -> Unit) = (0 until this).forEach(op)
fun Int.repeat(op: () -> Unit) = (0 until this).forEach { _ -> op() }

/**
 * Restricts [this] within the boundaries of [low] to [high], both inclusive.
 *
 * The returned value would nbe [this] when [this] is within the bounds or the value of [low] when [this] is lower,
 * or [high] if [this] is higher.
 */
fun Double.limit(low: Double = Double.NEGATIVE_INFINITY, high: Double = Double.POSITIVE_INFINITY) =
    max(min(this, high), low)

/**
 * Restricts [this] within the boundaries of [low] to [high], both inclusive.
 *
 * The returned value would nbe [this] when [this] is within the bounds or the value of [low] when [this] is lower,
 * or [high] if [this] is higher.
 */
fun Int.limit(low: Int = Int.MIN_VALUE, high: Int = Int.MAX_VALUE) =
    max(min(this, high), low)

/**
 * Restricts [this] within the boundaries of [low] to [high], both inclusive.
 *
 * The returned value would nbe [this] when [this] is within the bounds or the value of [low] when [this] is lower,
 * or [high] if [this] is higher.
 */
fun Long.limit(low: Long = Long.MIN_VALUE, high: Long = Long.MAX_VALUE) =
    max(min(this, high), low)


/**
 * Appends the numeric value with the correct single or plural form of the unit.
 */
fun Int.plural(single: String, plural: String = single.pluralForm, nvl: String? = null, noValue: Boolean = false) =
    this.toLong().plural(single, plural, nvl, noValue)

/**
 * Appends the numeric value with the correct single or plural form of the unit.
 */
fun Long.plural(single: String, plural: String = single.pluralForm, nvl: String? = null, noValue: Boolean = false) =
    (if (noValue) "" else "$this ") + when (this) {
        0L -> if (nvl == null) single else "$nvl $single"
        1L -> single
        else -> plural
    }


fun Int.be(isPast: Boolean = false) =
    if (this.absoluteValue < 2) {
        if (isPast) "was" else "is"
    } else {
        if (isPast) "were" else "are"
    }

fun Long.be(isPast: Boolean = false) =
    if (this.absoluteValue < 2) {
        if (isPast) "was" else "is"
    } else {
        if (isPast) "were" else "are"
    }


/**
 * Gives the modulo of [this] by 10^[digits].
 */
fun Int.cycle(digits: Int): Int {
    check(digits > 0)
    var v = 1
    (1..digits).forEach { _ -> v *= 10 }
    return this % v
}

// ***************************************
// ** STRING
// ***************************************

/**
 * Generates the regular plural form of [single] .
 */
val String.pluralForm get() = if (this.endsWith('y')) "${this.substringBeforeLast('y')}ies" else "${this}s"

/**
 * Keeps at most [count] characters from the end of [this]. If [ellipsis] provided, it is appended to the beginning of the
 * returned string. The kept length is reduced by the length of [ellipsis], so the returned string
 * never exceeds the [count] length.
 *
 * Doesn't throw exception when [count] is higher than the length of the string.
 */
fun String.tail(count: Int, ellipsis: String = "") =
    if (this.length > count)
        ellipsis + this.substring(this.length - count + ellipsis.length)
    else this


/**
 * Keeps at most [count] characters from [this]. If [ellipsis] provided, it is appended to the end of the
 * returned string. The kept length is reduced by the length of [ellipsis], so the returned string
 * never exceeds the [count] length.
 *
 * Doesn't throw exception when [count] is higher than the length of the string.
 */
fun String.head(count: Int, ellipsis: String = "") =
    if (this.length > count)
        this.substring(0, count - ellipsis.length) + ellipsis
    else this

/**
 * Trims or pads the [this] to [count] characters.
 */
fun String.trimOrPad(count: Int, padWith: Char = ' ') = this.head(count).padEnd(count, padWith)


/**
 * Prints the string to stdout.
 */
fun Any.println() = println(this)

fun String.escapeNewLine() = this.replace("\n", "\\n")

/**
 * Prints the string to stdout and returns [this].
 */
fun String.echo(): String = this.apply { println(this) }

/**
 * Inserts [other] into [this] at position [pos].
 *
 * @throws IndexOutOfBoundsException When [pos] is out of bounds.
 */
fun String.insert(pos: Int, other: String): String {
    if (pos !in (0..this.length)) throw IndexOutOfBoundsException("Insert index ($pos) is out of bounds in string (len: ${this.length})")
    return substring(0, pos) + other + substring(pos)
}

/**
 * Replaces the section defined by [range] of [this] with the [replacement].
 */
fun String.substitute(range: IntRange, replacement: String): String {
    return this.substring(0, range.first) + replacement + this.substring(range.last + 1)
}

/**
 * Converts [this] to Json using Gson parser.
 */
fun String.toJson(): JsonElement = JsonParser.parseString(this)


fun String.appendIfMissing(postfix: String) = if (this.endsWith(postfix)) this else this + postfix

fun humanReadableBytes(value: Long) = when {
    value < 1024 -> value.toString()
    value < 1024 * 1024 -> "%5.3f KB".format(value.toDouble() / 1024)
    value < 1024L * 1024 * 1024 -> "%5.3f MB".format(value.toDouble() / (1024 * 1024))
    else -> "%5.3f GB".format(value.toDouble() / (1024L * 1024 * 1024))
}


fun String.camelToUnderscore(upperCase: Boolean = false): String =
    CaseFormat.LOWER_CAMEL.to(if (upperCase) CaseFormat.UPPER_UNDERSCORE else CaseFormat.LOWER_UNDERSCORE, this)

fun String.underscoreToCamel(firstCharUpper: Boolean = false): String =
    CaseFormat.UPPER_UNDERSCORE.to(if (firstCharUpper) CaseFormat.UPPER_CAMEL else CaseFormat.LOWER_CAMEL, this)


fun String.whenEmpty(op: String.() -> String) = if (this.isEmpty()) op() else this
fun String.whenNotEmpty(op: String.() -> String) = if (this.isNotEmpty()) op() else this

fun String.indentBy(amount: Int = 4, char: Char = ' '): String {
    val ind = char.toString().repeat(amount)
    return this.split("\n").joinToString("\n") {
        ind + it
    }
}

fun String.crc32() = this.toByteArray().crc32()

fun ByteArray.crc32(): Long {
    val checksum: Checksum = CRC32() // java.util.zip.CRC32
    checksum.update(this, 0, this.size)
    return checksum.value
}

// ***************************************
// ** COLLECTIONS
// ***************************************

/**
 * Removes [count] items from the start of the [this].
 */
fun <T> List<T>.trim(count: Int) = this.subList(count, this.size)

fun <T> Collection<T>.plural(
    single: String,
    plural: String = single.pluralForm,
    nvl: String? = null,
    noValue: Boolean = false
) =
    this.size.plural(single, plural, nvl, noValue)

fun ByteArray.toHexString(showAscii: Boolean = true, upperCase: Boolean = false): String {
    fun String.uc() = if (upperCase) this.uppercase() else this

    val sb = StringBuilder()
    var ascii = " "
    this.forEachIndexed { index, byte ->
        if (index % 16 == 0) {
            if (index != 0) {
                if (showAscii) sb.append(ascii)
                sb.append('\n')
            }
            sb.append("%08x  ".format(index).uc())
            ascii = " "
        }
        sb.append("%02x ".format(byte).uc())
        if (index % 16 == 7) sb.append(' ')
        ascii += when (byte) {
            in 32..127 -> byte.toInt().toChar()
            else -> '.'
        }
    }
    if (showAscii) {
        if (this.size % 16 != 0) {
            (this.size % 16..15).forEach {
                sb.append("   ")

                if (it % 16 == 7) sb.append(' ')
            }
        }
        sb.append(ascii)
    }
    return sb.toString()
}


fun Collection<Int>.standardDeviance(): Double {
    val avg = this.average()
    return this.map { (it.toDouble() - avg) * (it.toDouble() - avg) }.sum() / this.size
}


inline fun <T, C : Collection<T>, V> C.whenEmpty(op: (C) -> V) = if (this.isEmpty()) op(this) else null
inline fun <T, C : Collection<T>, V> C.whenNotEmpty(op: (C) -> V) = if (this.isNotEmpty()) op(this) else null


/**
 * Performs a breadth-first search on the [root] item, using the [children] for collecting children.
 * The process is cycle-safe and [distinct] could be used to keep only the first appearance of the
 * items. The first item of the result is the [root] and it is guarantied that siblings appear in the order
 * they were returned by [children].
 */
fun <T> breadthList(root: T, distinct: Boolean = false, children: T.() -> List<T>): Deque<T> {
    val nodes = LinkedList<T>()
    val res = LinkedList<T>()
    nodes.add(root)
    while (nodes.isNotEmpty()) {
        val n = nodes.pollFirst()
        if (!distinct || !res.contains(n)) res.addLast(n)
        children(n).forEach { if (!res.contains(it)) nodes.addLast(it) }
    }
    return res
}

// ***************************************
// ** DATE & TIME
// ***************************************

val HunDateTimeFormatter: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
val HunDateFormatter: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
val HunTimeFormatter: DateTimeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss")
val FilenameIsoFormatter: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")
val EngDateTimeFormatter: DateTimeFormatter = DateTimeFormatter.ofPattern("MM/dd/yyyy hh:mm:ss a", Locale.US)


val LocalDateTime.asHun: String get() = this.format(HunDateTimeFormatter)
fun localDateTimeFromHun(src: String): LocalDateTime = LocalDateTime.from(HunDateTimeFormatter.parse(src))
val LocalDate.asHun: String get() = this.format(HunDateFormatter)
fun localDateFromHun(src: String): LocalDate = LocalDate.from(HunDateFormatter.parse(src))
val LocalTime.asHun: String get() = this.format(HunTimeFormatter)
fun localTimeFromHun(src: String): LocalTime = LocalTime.from(HunTimeFormatter.parse(src))


fun LocalDateTime.toMillis() = (this.toEpochSecond(ZoneOffset.UTC) * 1000L) + (this.nano / 1_000_000L)

val LocalDateTime.lastDayOfMonth get() = this.withDayOfMonth(1).plusMonths(1).minusDays(1).dayOfMonth
fun LocalDateTime.withDayOfMonthBackward(delta: Int): LocalDateTime {
    val ldom = this.lastDayOfMonth
    val value = max(1, ldom - if (delta < 0) abs(delta + 1) else delta)
    return this.withDayOfMonth(value)
}

fun String.gzip(): ByteArray {
    val bos = ByteArrayOutputStream()
    GZIPOutputStream(bos).bufferedWriter(UTF_8).use { it.write(this) }
    return bos.toByteArray()
}

fun ByteArray.ungzip(): String =
    GZIPInputStream(this.inputStream()).bufferedReader(UTF_8).use { it.readText() }

// ***************************************
// ** BOOLEANS
// ***************************************

fun <T : Any> Boolean.whenTrue(op: () -> T?) = if (this) op() else null
fun <T : Any> Boolean.whenFalse(op: () -> T?) = if (!this) op() else null

fun <T : Any> T.whileTrue(vararg ops: (T) -> Boolean): Boolean {
    for (op in ops) {
        if (!op(this)) return false
    }
    return true
}

fun <T : Any> T.whileFalse(vararg ops: (T) -> Boolean): Boolean {
    for (op in ops) {
        if (op(this)) return true
    }
    return false
}

// ***************************************
// ** BIG NUMERIC
// ***************************************

/**
 * Restricts [this] within the boundaries of [low] to [high], both inclusive.
 *
 * The returned value would nbe [this] when [this] is within the bounds or the value of [low] when [this] is lower,
 * or [high] if [this] is higher.
 */
fun BigDecimal.limit(low: BigDecimal, high: BigDecimal) = this.max(low).min(high)


// ***************************************
// ** BIG NUMERIC
// ***************************************


fun deleteDirectory(directory: Path, deleteRoot: Boolean = false) {
    if (Files.exists(directory)) {
        Files.walkFileTree(directory, object : SimpleFileVisitor<Path>() {
            override fun visitFile(path: Path, attr: BasicFileAttributes): FileVisitResult {
                Files.delete(path)
                return FileVisitResult.CONTINUE
            }

            override fun postVisitDirectory(path: Path, ex: IOException?): FileVisitResult {
                if (deleteRoot || path != directory) {
                    Files.delete(path)
                }
                return FileVisitResult.CONTINUE
            }
        })
    }
}