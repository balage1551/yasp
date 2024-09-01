package hu.vissy.yasp.image

import hu.vissy.yasp.module.web.BaseController
import org.slf4j.LoggerFactory
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import java.nio.file.Files
import java.nio.file.Path


@RequestMapping("/resource")
@RestController
class ResourceController : BaseController() {

    private val log = LoggerFactory.getLogger(ResourceController::class.java)


    @GetMapping("/test/image/{id}")
    fun getTestImage(@PathVariable id: Int): ResponseEntity<ByteArray> {
        log.info("Requesting test image: $id")
        val imgFile: Path = when(id) {
            1 -> Path.of("gallery/test/20240812-102654-0004.jpg")
            2 -> Path.of("gallery/test/20240813-101736-0016.jpg")
            3 -> Path.of("gallery/test/20240812-182703-0013.jpg")
            else -> throw IllegalArgumentException("Invalid image id: $id")
        }
        val imageBytes: ByteArray = Files.readAllBytes(imgFile)
        log.info("Test Image read, size: ${imageBytes.size}")

        val headers = HttpHeaders()
        headers.add("Content-Type", "image/jpeg")

        return ResponseEntity(imageBytes, headers, HttpStatus.OK)
    }



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
