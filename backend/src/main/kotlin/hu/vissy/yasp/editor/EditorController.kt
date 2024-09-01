package hu.vissy.yasp.editor

import hu.vissy.yasp.module.web.BaseController
import hu.vissy.yasp.resource.ResourceController
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.nio.file.Files
import java.nio.file.Path
import kotlin.io.path.extension


@RequestMapping("/editor")
@RestController
class EditorController : BaseController() {

    private val log = LoggerFactory.getLogger(ResourceController::class.java)


    @PostMapping("/scan")
    fun scanDirectory(@RequestBody @Validated request: ScanRequestDTO): ResponseEntity<ScanResultDTO> {
        log.info("Requesting scan: ${request.path}")
        val dir: Path = Path.of(request.path)
        return if (Files.exists(dir) && Files.isDirectory(dir)) {
            ResponseEntity(ScanResultDTO(true, Files.list(dir)
                .filter { Files.isRegularFile(it) && it.extension in setOf("jpg", "jpeg", "png") }
                .map { ImageInfoDTO(it.fileName.toString()) }
                .sorted { o1, o2 -> o1.fileName.compareTo(o2.fileName) }
                .toList()), HttpStatus.OK)
        } else {
            ResponseEntity(ScanResultDTO(false), HttpStatus.OK)
        }
    }
}
