package hu.vissy.yasp.slideshow

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


@RequestMapping("/slide-show")
@RestController
class SlideShowController : BaseController() {

    private val log = LoggerFactory.getLogger(ResourceController::class.java)


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
