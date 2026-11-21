<template>
  <application-layout>
    <div class="remote">
      <div class="remote-header">
        <v-icon size="28" class="mr-2">mdi-remote</v-icon>
        <span class="remote-title">{{ status?.name ?? $t('remoteControl.title') }}</span>
        <span class="remote-id">{{ id }}</span>
      </div>

      <div v-if="phase === 'connecting'" class="remote-message">
        <v-progress-circular indeterminate size="48" class="mb-4"></v-progress-circular>
        <div>{{ $t('remoteControl.connecting') }}</div>
      </div>

      <div v-else-if="phase === 'lost'" class="remote-message">
        <v-icon size="64" color="error" class="mb-4">mdi-lan-disconnect</v-icon>
        <div class="text-h6">{{ $t('remoteControl.lost') }}</div>
        <div class="remote-hint mb-6">{{ $t('remoteControl.lostHint') }}</div>
        <v-btn color="primary" variant="flat" size="x-large" block class="mb-3" @click="connect">
          {{ $t('remoteControl.reconnect') }}
        </v-btn>
        <v-btn variant="tonal" size="x-large" block @click="leave">{{ $t('remoteControl.back') }}</v-btn>
      </div>

      <template v-else>
        <div class="remote-status">
          <div class="remote-position">
            <template v-if="status && status.total > 0">
              {{ status.position }}<span class="remote-total"> / {{ status.total }}</span>
            </template>
            <template v-else>–</template>
          </div>
          <div class="remote-state">
            <v-icon size="20" class="mr-1">{{ stateIcon }}</v-icon>
            {{ status?.state ? $t('remoteControl.states.' + status.state) : '' }}
            <span v-if="status?.index" class="ml-2 remote-hint">#{{ status.index }}</span>
          </div>
        </div>

        <div class="remote-controls">
          <v-btn class="remote-button" color="primary" variant="flat" :disabled="!status?.canGoBack"
                 @click="send('prev')">
            <v-icon size="48">mdi-skip-previous</v-icon>
          </v-btn>
          <v-btn v-if="isHeld" class="remote-button remote-button-main" color="green" variant="flat"
                 @click="send('resume')">
            <v-icon size="64">mdi-play</v-icon>
          </v-btn>
          <v-btn v-else class="remote-button remote-button-main" color="orange" variant="flat"
                 @click="send('pause')">
            <v-icon size="64">mdi-pause</v-icon>
          </v-btn>
          <v-btn class="remote-button" color="primary" variant="flat" :disabled="!status?.canGoForward"
                 @click="send('next')">
            <v-icon size="48">mdi-skip-next</v-icon>
          </v-btn>
        </div>

        <v-btn class="remote-wide-button" :variant="status?.thumbnailsVisible ? 'flat' : 'tonal'" color="primary"
               size="x-large" block @click="send('toggleThumbnails')">
          <v-icon size="32" class="mr-2">mdi-view-carousel</v-icon>
          {{ $t('remoteControl.thumbnails') }}
        </v-btn>

        <div class="flex-grow-1"></div>

        <v-btn class="mt-6" variant="text" color="error" size="large" block @click="disconnect">
          <v-icon class="mr-2">mdi-close</v-icon>
          {{ $t('remoteControl.disconnect') }}
        </v-btn>
      </template>
    </div>
  </application-layout>
</template>

<script setup lang="ts">

import { VBtn, VIcon, VProgressCircular } from 'vuetify/components'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ApplicationLayout from '@/layouts/ApplicationLayout.vue'
import useRemoteControlApi, {
  forgetRemoteToken,
  isGone,
  loadRemoteToken,
  RemoteCommand,
  RemoteSession,
  RemoteStatus,
  storeRemoteToken
} from '@/api/remoteControlApi'

const POLL_MS = 1500
const POLL_AFTER_COMMAND_MS = 800
const RETRY_AFTER_ERROR_MS = 3000

const api = useRemoteControlApi()
const route = useRoute()
const router = useRouter()

const id = computed(() => String(route.params.id))
const phase = ref<'connecting' | 'connected' | 'lost'>('connecting')
const session = shallowRef<RemoteSession>()
const status = ref<RemoteStatus | null>(null)

// Values of SlideShowState (not imported: that module pulls in the image cache of the player)
const isHeld = computed(() => status.value?.state === 'manualHold' || status.value?.state === 'holdOnSlide')

const stateIcon = computed(() => {
  switch (status.value?.state) {
    case 'playing':
      return 'mdi-play'
    case 'holdOnSlide':
      return 'mdi-gesture-tap'
    case 'manualHold':
      return 'mdi-pause'
    case 'finished':
      return 'mdi-stop'
    default:
      return 'mdi-help'
  }
})

let timer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  const token = loadRemoteToken(id.value)
  if (token) {
    useSession({ id: id.value, token })
  } else {
    connect()
  }
})

onBeforeUnmount(() => {
  clearTimeout(timer)
})

function connect() {
  phase.value = 'connecting'
  api.connect(id.value).then((response) => {
    storeRemoteToken(id.value, response.token)
    useSession({ id: id.value, token: response.token })
  }).catch(() => {
    lost()
  })
}

function useSession(s: RemoteSession) {
  session.value = s
  phase.value = 'connected'
  poll()
}

function lost() {
  clearTimeout(timer)
  forgetRemoteToken(id.value)
  session.value = undefined
  status.value = null
  phase.value = 'lost'
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
  api.remotePoll(s).then((response) => {
    if (session.value !== s) {
      return
    }
    status.value = response.status
    schedule(POLL_MS)
  }).catch((e) => {
    if (session.value !== s) {
      return
    }
    if (isGone(e)) {
      lost()
    } else {
      schedule(RETRY_AFTER_ERROR_MS)
    }
  })
}

function send(command: RemoteCommand) {
  const s = session.value
  if (!s) {
    return
  }
  navigator.vibrate?.(20)
  api.sendCommand(s, command).then(() => {
    // The player picks the command up within its poll interval; refresh the status soon after.
    if (session.value === s) {
      schedule(POLL_AFTER_COMMAND_MS)
    }
  }).catch((e) => {
    if (isGone(e) && session.value === s) {
      lost()
    }
  })
}

function disconnect() {
  const s = session.value
  if (s) {
    api.close(s).catch(() => {})
  }
  lost()
  leave()
}

function leave() {
  router.push({ name: 'Dashboard' })
}

</script>

<style scoped>

.remote {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  max-width: 480px;
  margin: 0 auto;
  padding: 16px;
  color: whitesmoke;
  background-color: #1a1a1a;
  -webkit-user-select: none;
  user-select: none;
  touch-action: manipulation;
}

.remote-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin: -16px -16px 16px;
  background-color: #143d96;
}

.remote-title {
  font-size: 1.2em;
  font-weight: bold;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remote-id {
  font-family: monospace;
  opacity: 0.7;
}

.remote-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-top: 25%;
}

.remote-hint {
  color: #aaaaaa;
}

.remote-status {
  text-align: center;
  padding: 16px 0 24px;
}

.remote-position {
  font-size: 3.5em;
  font-weight: bold;
  line-height: 1.1;
}

.remote-total {
  font-size: 0.5em;
  color: #aaaaaa;
}

.remote-state {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cccccc;
}

.remote-controls {
  display: grid;
  grid-template-columns: 1fr 1.4fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.remote-button {
  height: 112px !important;
  min-width: 0 !important;
}

.remote-button-main {
  height: 112px !important;
}

.remote-wide-button {
  height: 72px !important;
}

/* Vuetify's block buttons grow (flex: 1 0 auto), which in the column would eat the free space */
.remote :deep(.v-btn--block) {
  flex: 0 0 auto;
}

</style>
