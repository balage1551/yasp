<template>
  <div class="remote-thumbnail">
    <img v-if="url" :src="url" :alt="imageName" draggable="false"/>
    <v-icon v-else-if="!imageName" size="40" class="remote-thumbnail-empty">{{ emptyIcon }}</v-icon>
    <v-progress-circular v-if="loading" indeterminate size="28" class="remote-thumbnail-loading"></v-progress-circular>
  </div>
</template>

<script setup lang="ts">

import { VIcon, VProgressCircular } from 'vuetify/components'
import { onBeforeUnmount, ref, watch } from 'vue'
import { UncachedImageLoad, useImageCache } from '@/stores/imageCacheStore'

/**
 * A thumbnail on the remote control screen. On a change it keeps showing the previous image until
 * the new one arrives, so stepping through the slides does not flash an empty box.
 */
const props = withDefaults(defineProps<{
  imageName?: string
  // Size requested from the server; the image is fitted into the box keeping its aspect ratio.
  width: number
  height: number
  emptyIcon?: string
}>(), {
  imageName: undefined,
  emptyIcon: 'mdi-image-off-outline'
})

const imageCache = useImageCache()

const url = ref<string>()
const loading = ref(false)
let pending: UncachedImageLoad | undefined

function release(objectUrl: string | undefined) {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
  }
}

watch(() => props.imageName, (imageName) => {
  pending?.cancel()
  pending = undefined
  if (!imageName) {
    release(url.value)
    url.value = undefined
    loading.value = false
    return
  }
  loading.value = true
  const load = imageCache.loadUncached(imageName, props.width, props.height)
  pending = load
  load.promise.then((newUrl) => {
    if (pending !== load) {
      release(newUrl)
      return
    }
    release(url.value)
    url.value = newUrl
  }).catch((e) => {
    console.error('Remote thumbnail failed', imageName, e)
  }).finally(() => {
    if (pending === load) {
      pending = undefined
      loading.value = false
    }
  })
}, { immediate: true })

onBeforeUnmount(() => {
  pending?.cancel()
  pending = undefined
  release(url.value)
})

</script>

<style scoped>

.remote-thumbnail {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #111111;
  border-radius: 6px;
  overflow: hidden;
}

.remote-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.remote-thumbnail-empty {
  color: #555555;
}

.remote-thumbnail-loading {
  position: absolute;
  right: 8px;
  bottom: 8px;
  color: #ffffffaa;
}

</style>
