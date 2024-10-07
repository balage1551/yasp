package hu.vissy.yasp

class Arguments(
    val path: String,
    val doNotOpenBrowser: Boolean,
    val editorDisabled: Boolean,
    val editorLocked: Boolean
) {
}

lateinit var arguments: Arguments
