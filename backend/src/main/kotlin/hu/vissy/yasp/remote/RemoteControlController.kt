package hu.vissy.yasp.remote

import com.fasterxml.jackson.databind.JsonNode
import hu.vissy.yasp.module.web.BaseController
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

data class RemoteOpenResponseDTO(val id: String, val token: String)

data class RemoteConnectRequestDTO(val id: String)

data class RemoteConnectResponseDTO(val token: String)

data class RemoteSessionRequestDTO(val id: String, val token: String)

data class PlayerPollRequestDTO(val id: String, val token: String, val status: JsonNode?)

data class RemoteCommandRequestDTO(val id: String, val token: String, val command: String)

data class RemotePollResponseDTO(val status: JsonNode?)

/**
 * Remote control of a running playback, see [RemoteControlService].
 *
 * A gone session (expired, closed, or the remote was replaced by another one) answers 410 Gone.
 */
@RequestMapping("/remote-control")
@RestController
class RemoteControlController(private val service: RemoteControlService) : BaseController() {

    @PostMapping("/open")
    fun open(): RemoteOpenResponseDTO {
        val (id, token) = service.open()
        return RemoteOpenResponseDTO(id, token)
    }

    @PostMapping("/connect")
    fun connect(@RequestBody request: RemoteConnectRequestDTO): ResponseEntity<RemoteConnectResponseDTO> {
        val token = service.connect(request.id.trim()) ?: return ResponseEntity(HttpStatus.NOT_FOUND)
        return ResponseEntity.ok(RemoteConnectResponseDTO(token))
    }

    @PostMapping("/player/poll")
    fun playerPoll(@RequestBody request: PlayerPollRequestDTO): ResponseEntity<RemoteControlService.PlayerPollResult> {
        val result = service.playerPoll(request.id, request.token, request.status) ?: return ResponseEntity(HttpStatus.GONE)
        return ResponseEntity.ok(result)
    }

    @PostMapping("/remote/command")
    fun command(@RequestBody request: RemoteCommandRequestDTO): ResponseEntity<Unit> {
        return if (service.sendCommand(request.id, request.token, request.command)) {
            ResponseEntity(HttpStatus.OK)
        } else {
            ResponseEntity(HttpStatus.GONE)
        }
    }

    @PostMapping("/remote/poll")
    fun remotePoll(@RequestBody request: RemoteSessionRequestDTO): ResponseEntity<RemotePollResponseDTO> {
        return try {
            ResponseEntity.ok(RemotePollResponseDTO(service.remotePoll(request.id, request.token)))
        } catch (e: RemoteControlService.SessionGoneException) {
            ResponseEntity(HttpStatus.GONE)
        }
    }

    @PostMapping("/close")
    fun close(@RequestBody request: RemoteSessionRequestDTO): ResponseEntity<Unit> {
        service.close(request.id, request.token)
        return ResponseEntity(HttpStatus.OK)
    }
}
