package hu.vissy.yasp.resource

import hu.vissy.yasp.module.web.BaseController
import org.slf4j.LoggerFactory
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.nio.file.Files
import java.nio.file.Path


@RequestMapping("/resource")
@RestController
class ResourceController : BaseController() {

    private val log = LoggerFactory.getLogger(ResourceController::class.java)

    @PostMapping("/image")
    fun getImage(@RequestBody @Validated request: ImageRequestDTO): ResponseEntity<ByteArray> {
        log.info("Requesting image: ${request.fileName}")
        val imgFile: Path = Path.of("gallery/test/${request.fileName}")
        val imageBytes: ByteArray = Files.readAllBytes(imgFile)
        log.info("Image read, size: ${imageBytes.size}")

        val headers = HttpHeaders()
        headers.add("Content-Type", "image/jpeg")

        return ResponseEntity(imageBytes, headers, HttpStatus.OK)
    }
}
