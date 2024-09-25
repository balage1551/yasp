package hu.vissy.yasp.slideshow

import com.fasterxml.jackson.databind.ObjectMapper
import com.google.gson.JsonParser
import hu.vissy.yasp.arguments
import hu.vissy.yasp.module.web.BaseController
import hu.vissy.yasp.utils.jsonObject
import hu.vissy.yasp.utils.toPretty
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
            !arguments.editorDisabled,
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


    @PostMapping("/save")
    fun save(@RequestBody @Validated request: SlideShowSaveRequestDTO): ResponseEntity<String> {
        if (arguments.editorDisabled) {
            return ResponseEntity(jsonObject { "error" += "saveNotAllowed" }.toString(), HttpStatus.FORBIDDEN)
        }
        log.info("Requesting slideShow save: ${request.path} ${request.name} [originally: ${request.originalName}]\n${request.data}")
        val slideShowDefinitionFile: Path = Path.of("${request.path}/${request.name}.yasp.json")
        val backupSlideShowDefinitionFile: Path = Path.of("${request.path}/${request.name}.yasp.old.json")
        if (Files.exists(slideShowDefinitionFile) && request.originalName != request.name) {
            log.error("Slide show already exists: $slideShowDefinitionFile")
            return ResponseEntity(jsonObject { "error" += "alreadyExists" }.toString(), HttpStatus.BAD_REQUEST)
        }
        if (Files.exists(backupSlideShowDefinitionFile)) {
            Files.delete(backupSlideShowDefinitionFile)
        }
        if (Files.exists(slideShowDefinitionFile)) {
            Files.move(slideShowDefinitionFile, backupSlideShowDefinitionFile)
        }
        val objectMapper = ObjectMapper()
        val jsonString = objectMapper.writeValueAsString(request.data)
        val gson = JsonParser.parseString(jsonString).asJsonObject
        Files.writeString(slideShowDefinitionFile, gson.toPretty())

        return ResponseEntity(jsonObject { "success" += true }.toString(), HttpStatus.OK)
    }



    @PostMapping("/delete")
    fun save(@RequestBody @Validated request: SlideShowDeleteDTO): ResponseEntity<String> {
        if (arguments.editorDisabled) {
            return ResponseEntity(jsonObject { "error" += "saveNotAllowed" }.toString(), HttpStatus.FORBIDDEN)
        }
        log.info("Deleting slideShow: ${request.path} ${request.name}")
        val slideShowDefinitionFile: Path = Path.of("${request.path}/${request.name}.yasp.json")
        if (Files.exists(slideShowDefinitionFile)) {
            Files.delete(slideShowDefinitionFile)
        }
        return ResponseEntity("ok", HttpStatus.OK)
    }
}
