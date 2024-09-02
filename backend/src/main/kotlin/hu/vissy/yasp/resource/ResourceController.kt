package hu.vissy.yasp.resource

import hu.vissy.yasp.arguments
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
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import java.nio.file.Files
import java.nio.file.Path
import javax.imageio.ImageIO


@RequestMapping("/resource")
@RestController
class ResourceController : BaseController() {

    private val log = LoggerFactory.getLogger(ResourceController::class.java)

    @PostMapping("/image")
    fun getImage(@RequestBody @Validated request: ImageRequestDTO): ResponseEntity<ByteArray> {
        log.info("Requesting image: ${request.fileName}")
        val imgFile: Path = Path.of("${arguments.path}/${request.fileName}")
        val imageBytes: ByteArray = Files.readAllBytes(imgFile)
        log.info("Image read, size: ${imageBytes.size}")

        val headers = HttpHeaders()
        headers.add("Content-Type", "image/jpeg")

        return ResponseEntity(imageBytes, headers, HttpStatus.OK)
    }

    private val thumbnailCache = mutableMapOf<String, ByteArray>()

    @PostMapping("/thumbnail")
    fun getThumbnail(@RequestBody @Validated request: ImageRequestDTO): ResponseEntity<ByteArray> {
        val key = "${arguments.path}/${request.fileName}"
        log.info("Requesting thumbnail: $key")
        if (!thumbnailCache.containsKey(key)) {
            val imgFile: Path = Path.of(key)
            val originalImage: BufferedImage = ImageIO.read(Files.newInputStream(imgFile))

            val (width, height) = calculateThumbnailSize(originalImage.width, originalImage.height, 120, 80)
            val resizedImage = BufferedImage(width, height, BufferedImage.TYPE_INT_RGB)
            val graphics = resizedImage.createGraphics()
            graphics.drawImage(originalImage, 0, 0, width, height, null)
            graphics.dispose()

            val outputStream = ByteArrayOutputStream()
            ImageIO.write(resizedImage, "jpeg", outputStream)
            val imageBytes = outputStream.toByteArray()
            log.info("Thumbnail generated, size: ${imageBytes.size}")
            thumbnailCache[key] = imageBytes
        }

        val imageBytes = thumbnailCache[key]!!
        val headers = HttpHeaders()
        headers.add("Content-Type", "image/jpeg")

        return ResponseEntity(imageBytes, headers, HttpStatus.OK)
    }

    private fun calculateThumbnailSize(originalWidth: Int, originalHeight: Int, maxWidth: Int, maxHeight: Int): Pair<Int, Int> {
        val aspectRatio = originalWidth.toDouble() / originalHeight
        return if (originalWidth > maxWidth || originalHeight > maxHeight) {
            if (aspectRatio > 1) {
                val width = maxWidth
                val height = (maxWidth / aspectRatio).toInt()
                width to height
            } else {
                val height = maxHeight
                val width = (maxHeight * aspectRatio).toInt()
                width to height
            }
        } else {
            originalWidth to originalHeight
        }
    }
}
