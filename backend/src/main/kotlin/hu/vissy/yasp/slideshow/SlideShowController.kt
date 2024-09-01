package hu.vissy.yasp.slideshow

import hu.vissy.yasp.arguments
import hu.vissy.yasp.module.web.BaseController
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import java.nio.file.Files
import java.nio.file.Path


@RequestMapping("/slide-show")
@RestController
class SlideShowController : BaseController() {

    private val log = LoggerFactory.getLogger(SlideShowController::class.java)

    @GetMapping("/list")
    fun list(): ResponseEntity<SlideShowListResponseDTO> {
        val rootPath: Path = Path.of(arguments.path)
        val slideShowListResponseDTO = SlideShowListResponseDTO(arguments.path,
            Files.list(rootPath)
            .filter { Files.isRegularFile(it) && it.fileName.toString().endsWith(".yasp.json") }
            .map { SlideShowListItemDTO(it.fileName.toString().substringBeforeLast(".yasp.json")) }
            .toList())
        return ResponseEntity(slideShowListResponseDTO, HttpStatus.OK)
    }

    @PostMapping("/load")
    fun getImage(@RequestBody @Validated request: SlideShowRequestDTO): ResponseEntity<String> {
        log.info("Requesting slideShow: ${request.path}")
        val slideShowDefinitionFile: Path = Path.of("${request.path}/${request.name}.yasp.json")
        if (!Files.exists(slideShowDefinitionFile)) {
            throw IllegalArgumentException("Slide show definition file not found: $slideShowDefinitionFile")
        } else {
            val definition = Files.readString(slideShowDefinitionFile)
            return ResponseEntity(definition, HttpStatus.OK)
        }
    }
}
