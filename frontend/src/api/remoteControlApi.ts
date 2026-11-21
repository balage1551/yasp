import { request } from '@/utils/request'

/** Commands the remote sends to the playback. */
export type RemoteCommand = 'next' | 'prev' | 'pause' | 'resume' | 'toggleThumbnails'

/**
 * Snapshot of the playback, pushed by the player on every poll and shown on the remote.
 * Extend it freely: the server passes it through untouched.
 */
export type RemoteStatus = {
  name?: string
  state?: string
  index: string
  position: number
  total: number
  imageName?: string
  thumbnailsVisible: boolean
  canGoBack: boolean
  canGoForward: boolean
}

export type RemoteSession = {
  id: string
  token: string
}

export type PlayerPollResponse = {
  connected: boolean
  commands: RemoteCommand[]
}

/** Status of a request rejected because the session is gone (expired, closed or taken over). */
export const HTTP_GONE = 410

export function isGone(error: unknown) {
  return (error as { response?: { status?: number } })?.response?.status === HTTP_GONE
}

function open(): Promise<RemoteSession> {
  return request({ url: '/remote-control/open', method: 'post' })
}

function connect(id: string): Promise<{ token: string }> {
  return request({ url: '/remote-control/connect', method: 'post', data: { id } })
}

function playerPoll(session: RemoteSession, status: RemoteStatus | undefined): Promise<PlayerPollResponse> {
  return request({ url: '/remote-control/player/poll', method: 'post', data: { ...session, status } })
}

function sendCommand(session: RemoteSession, command: RemoteCommand): Promise<void> {
  return request({ url: '/remote-control/remote/command', method: 'post', data: { ...session, command } })
}

function remotePoll(session: RemoteSession): Promise<{ status: RemoteStatus | null }> {
  return request({ url: '/remote-control/remote/poll', method: 'post', data: session })
}

function close(session: RemoteSession): Promise<void> {
  return request({ url: '/remote-control/close', method: 'post', data: session })
}

const remoteControlApiInstance = {
  open,
  connect,
  playerPoll,
  sendCommand,
  remotePoll,
  close
}

export default function useRemoteControlApi() {
  return remoteControlApiInstance
}

// The remote keeps its token per tab, so a reload of the remote screen continues the same connection.
const TOKEN_KEY_PREFIX = 'yasp.remoteControl.'

export function storeRemoteToken(id: string, token: string) {
  try {
    sessionStorage.setItem(TOKEN_KEY_PREFIX + id, token)
  } catch (e) {
    // Storage unavailable: a reload will simply connect again
  }
}

export function loadRemoteToken(id: string): string | undefined {
  try {
    return sessionStorage.getItem(TOKEN_KEY_PREFIX + id) ?? undefined
  } catch (e) {
    return undefined
  }
}

export function forgetRemoteToken(id: string) {
  try {
    sessionStorage.removeItem(TOKEN_KEY_PREFIX + id)
  } catch (e) {
    // ignore
  }
}
