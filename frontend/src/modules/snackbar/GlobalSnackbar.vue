<template>
  <div>
    <v-snackbar v-for="s in visibleShelf" :id="'gsb'+s.id" :color="s.color" :key="s.id" :model-value="s.show"
                :style="s.style" :timeout="s.timeout" @update:modelValue="closed(s)">
      {{ s.message }}
      <template #actions>
        <v-btn @click="closed(s)">{{ $t('common.close') }}</v-btn>
      </template>
    </v-snackbar>
  </div>

</template>

<script setup lang="ts">
import { VBtn, VSnackbar } from 'vuetify/components'
import { useSnackbarStore } from '@/modules/snackbar/snackbarStore'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { SnackPacket } from '@/modules/snackbar/GlobalSnackbarTypes'

const snackbarStore = useSnackbarStore()

const props = withDefaults(defineProps<{
  gap?: number,
  maxStack?: number,
}>(), { gap: 10, maxStack: 5 })

onMounted(() => {
  shelf.value.splice(0, shelf.value.length)
  snackbarStore.callback = callback
})

onUnmounted(() => {
  snackbarStore.callback = undefined
})

class SnackContainer implements SnackPacket {
  private static counter = 0

  readonly message: string
  readonly color: string
  readonly timeout: number
  show: boolean = false
  style: string = ''

  readonly id: number = SnackContainer.counter++

  constructor(packet: SnackPacket) {
    this.message = packet.message
    this.color = packet.color
    this.timeout = packet.timeout
  }
}

const shelf = ref<SnackContainer[]>([])
const visibleShelf = computed(() => {
  return shelf.value.slice(0, props.maxStack)
})

function recalculatePositions() {
  nextTick(() => {
    let bottom = props.gap
    for (let i = visibleShelf.value.length - 1; i >= 0; i--) {
      const s = visibleShelf.value[i]
      const d = document.querySelector('#gsb' + s.id + ' .v-snackbar__wrapper')
      if (d) {
        s.style = `margin-bottom: ${bottom}px;`
        bottom += d.clientHeight + props.gap
      }
    }
  })
}

const callback = (packet?: SnackPacket) => {
  if (packet) {
    const cont: SnackContainer = new SnackContainer(packet)
    shelf.value.push(cont)
    recalculatePositions()
    cont.show = true
  } else {
    shelf.value.forEach((s) => {
      s.show = false
    })
    shelf.value.splice(0, shelf.value.length)
    recalculatePositions()
  }
}

function closed(s: SnackContainer) {
  s.show = false
  const p = shelf.value.indexOf(s)
  if (p !== -1) {
    shelf.value.splice(p, 1)
  }
  recalculatePositions()
}
</script>
