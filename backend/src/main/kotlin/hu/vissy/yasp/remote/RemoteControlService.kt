package hu.vissy.yasp.remote

import com.fasterxml.jackson.databind.JsonNode
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.security.SecureRandom
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import kotlin.collections.ArrayDeque
import kotlin.collections.List
import kotlin.collections.filter
import kotlin.collections.forEach
import kotlin.collections.toList

/**
 * In-memory remote control sessions.
 *
 * A playback opens a session and gets a 6-digit id (shown on the screen) and a player token.
 * A remote connects with the id and gets a remote token; connecting again (e.g. after a reload of
 * the phone) replaces the previous remote. Both sides talk to the session by polling:
 *  - the player polls for the commands the remote queued, sending its current status with it,
 *  - the remote sends commands and polls the latest status of the player.
 *
 * The status is an opaque JSON snapshot, so new information can be propagated to the remote
 * without touching the server.
 */
@Service
class RemoteControlService {

    private class Session(
        val id: String,
        val playerToken: String
    ) {
        var remoteToken: String? = null
        val commands = ArrayDeque<String>()
        var status: JsonNode? = null
        var lastPlayerPoll: Long = now()
        var lastRemotePoll: Long = 0

        fun isRemoteConnected() = remoteToken != null && now() - lastRemotePoll < REMOTE_TIMEOUT_MS
        fun isPlayerAlive() = now() - lastPlayerPoll < PLAYER_TIMEOUT_MS
    }

    private val sessions = ConcurrentHashMap<String, Session>()
    private val random = SecureRandom()

    fun open(): Pair<String, String> {
        cleanup()
        while (true) {
            val id = String.format("%06d", random.nextInt(1_000_000))
            val session = Session(id, UUID.randomUUID().toString())
            if (sessions.putIfAbsent(id, session) == null) {
                log.info("Remote control session opened: $id")
                return id to session.playerToken
            }
        }
    }

    /** Returns the remote token, or null if there is no live session with this id. */
    fun connect(id: String): String? {
        val session = liveSession(id) ?: return null
        synchronized(session) {
            val token = UUID.randomUUID().toString()
            session.remoteToken = token
            session.lastRemotePoll = now()
            session.commands.clear()
            log.info("Remote control connected: $id")
            return token
        }
    }

    fun playerPoll(id: String, token: String, status: JsonNode?): PlayerPollResult? {
        val session = liveSession(id)?.takeIf { it.playerToken == token } ?: return null
        synchronized(session) {
            session.lastPlayerPoll = now()
            if (status != null && !status.isNull) {
                session.status = status
            }
            val commands = session.commands.toList()
            session.commands.clear()
            return PlayerPollResult(session.isRemoteConnected(), commands)
        }
    }

    /** Returns false if the session is gone or the remote is no longer the connected one. */
    fun sendCommand(id: String, token: String, command: String): Boolean {
        val session = remoteSession(id, token) ?: return false
        synchronized(session) {
            session.lastRemotePoll = now()
            if (session.commands.size < MAX_QUEUED_COMMANDS) {
                session.commands.addLast(command)
            }
            return true
        }
    }

    fun remotePoll(id: String, token: String): JsonNode? {
        val session = remoteSession(id, token) ?: throw SessionGoneException()
        synchronized(session) {
            session.lastRemotePoll = now()
            return session.status
        }
    }

    fun close(id: String, token: String) {
        val session = sessions[id] ?: return
        synchronized(session) {
            if (session.playerToken == token) {
                sessions.remove(id)
                log.info("Remote control session closed by player: $id")
            } else if (session.remoteToken == token) {
                session.remoteToken = null
                log.info("Remote control disconnected: $id")
            }
        }
    }

    private fun remoteSession(id: String, token: String) =
        liveSession(id)?.takeIf { it.remoteToken == token }

    private fun liveSession(id: String): Session? {
        val session = sessions[id] ?: return null
        if (!session.isPlayerAlive()) {
            sessions.remove(id)
            log.info("Remote control session expired: $id")
            return null
        }
        return session
    }

    private fun cleanup() {
        sessions.values.filter { !it.isPlayerAlive() }.forEach {
            sessions.remove(it.id)
            log.info("Remote control session expired: ${it.id}")
        }
    }

    data class PlayerPollResult(val connected: Boolean, val commands: List<String>)

    class SessionGoneException : RuntimeException()

    companion object {
        private val log = LoggerFactory.getLogger(RemoteControlService::class.java)

        /** The player polls every second; a session without player poll for this long is dropped. */
        const val PLAYER_TIMEOUT_MS = 30_000L

        /** The remote polls every 1.5 seconds; without it for this long the remote counts as gone. */
        const val REMOTE_TIMEOUT_MS = 15_000L

        const val MAX_QUEUED_COMMANDS = 50

        private fun now() = System.currentTimeMillis()
    }
}
