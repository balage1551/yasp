import { computed, onBeforeUnmount, ref, shallowRef } from 'vue'
import useRemoteControlApi, { isGone, RemoteCommand, RemoteSession, RemoteStatus } from '@/api/remoteControlApi'

const POLL_WHILE_WAITING_MS = 1000
const POLL_WHILE_CONNECTED_MS = 500
const RETRY_AFTER_ERROR_MS = 2000

/**
 * The playback side of the remote control: opens a session on the server, then polls it for the
 * commands of the remote, pushing the current playback status with each poll.
 */
export function useRemoteControlHost(
  getStatus: () => RemoteStatus,
  onCommand: (command: RemoteCommand) => void
) {
  const api = useRemoteControlApi()
  const session = shallowRef<RemoteSession>()
  const connected = ref(false)
  const starting = ref(false)
  const active = computed(() => session.value !== undefined)
  const waiting = computed(() => (active.value || starting.value) && !connected.value)

  let timer: ReturnType<typeof setTimeout> | undefined

  function start() {
    if (active.value || starting.value) {
      return
    }
    starting.value = true
    api.open().then((s) => {
      if (!starting.value) {
        // Cancelled while opening
        api.close(s).catch(() => {})
        return
      }
      session.value = s
      poll()
    }).catch((e) => {
      console.error('Remote control: could not open session', e)
    }).finally(() => {
      starting.value = false
    })
  }

  function stop() {
    starting.value = false
    clearTimeout(timer)
    timer = undefined
    const s = session.value
    session.value = undefined
    connected.value = false
    if (s) {
      api.close(s).catch(() => {})
    }
  }

  function schedule(delay: number) {
    clearTimeout(timer)
    timer = setTimeout(poll, delay)
  }

  function poll() {
    const s = session.value
    if (!s) {
      return
    }
    api.playerPoll(s, getStatus()).then((response) => {
      if (session.value !== s) {
        return
      }
      connected.value = response.connected
      response.commands.forEach((command) => {
        try {
          onCommand(command)
        } catch (e) {
          console.error('Remote control: command failed', command, e)
        }
      })
      schedule(connected.value ? POLL_WHILE_CONNECTED_MS : POLL_WHILE_WAITING_MS)
    }).catch((e) => {
      if (session.value !== s) {
        return
      }
      if (isGone(e)) {
        // The server forgot the session (e.g. it was restarted): remote control is off.
        console.warn('Remote control: session is gone')
        session.value = undefined
        connected.value = false
      } else {
        schedule(RETRY_AFTER_ERROR_MS)
      }
    })
  }

  onBeforeUnmount(stop)

  return {
    id: computed(() => session.value?.id),
    active,
    connected,
    waiting,
    start,
    stop
  }
}
