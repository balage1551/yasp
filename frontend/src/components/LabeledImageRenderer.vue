<template>
  <div ref="container" class="cont" :style="containerStyle" v-bind="props">
    <div v-if="!imageLoaded" class="loading" >
      <v-progress-circular
        class="justify-center"
        indeterminate
        color="white"></v-progress-circular>
    </div>
    <v-img v-if="slide" ref="imageTag" eager :style="containerStyle" :src="image" alt="slideInfo.imageName" aspect-ratio="1"  :draggable="false" @load="imageLoaded = true" ></v-img>
    <label-handler v-if="imageLoaded && labelToRender" :image="imageTag" :label="labelToRender"></label-handler>
    <slot class="top"></slot>
  </div>
</template>
<script setup lang="ts">

import { VImg, VProgressCircular } from 'vuetify/components'
import { ImageSlide, LabelInfo } from '@/entities/SlideShowTypes'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import LabelHandler from '@/components/LabelHandler.vue'
import { useIntersectionObserver, useWindowSize } from '@vueuse/core'
import { UncachedImageLoad, useImageCache } from '@/stores/imageCacheStore'

const props = withDefaults(defineProps<{
  slide: ImageSlide,
  width?: number,
  height?: number,
  label?: LabelInfo | undefined
  background?: string,
  // Shown by the slideshow itself: goes through the image cache and its prefetch queue.
  // Otherwise (thumbnails) it is loaded on its own and freed when no longer shown.
  cached?: boolean,
  // Loads only once it gets near the visible area of its scroll container.
  lazy?: boolean
}>(), {
  width: undefined,
  height: undefined,
  label: undefined,
  background: '#333333',
  cached: false,
  lazy: true
})

const imageCacheStore = useImageCache()

const imageTag = ref<HTMLImageElement | undefined>()
const image = ref<string | Blob | undefined>(undefined)
const imageLoaded = ref(false)
const labelToRender = computed(() => {
  return props.label ?? props.slide.label
})
const windowSize = useWindowSize()

// Whole pixels: the size is part of the request and of the cache key.
const viewWidth = computed(() => Math.round(props.width ?? windowSize.width.value))
const viewHeight = computed(() => Math.round(props.height ?? windowSize.height.value))

const emit = defineEmits<{(e: 'image-loaded'): void
}>()

const containerStyle = computed(() => {
  return {
    width: viewWidth.value + 'px',
    height: viewHeight.value + 'px',
    minWidth: viewWidth.value + 'px',
    minHeight: viewHeight.value + 'px',
  }
})

// LAZY LOADING

// Images this far outside the visible area of their scroll container start loading already.
const LAZY_MARGIN = '300px'

const container = ref<HTMLDivElement>()
const scrollRoot = ref<HTMLElement | null>(null)
// Latched: an image that has once been near the view stays loaded.
const seen = ref(!props.lazy)

function findScrollParent(element: HTMLElement | undefined): HTMLElement | null {
  let parent = element?.parentElement
  while (parent) {
    const overflowY = getComputedStyle(parent).overflowY
    if (overflowY === 'auto' || overflowY === 'scroll') {
      return parent
    }
    parent = parent.parentElement
  }
  return null
}

onMounted(() => {
  if (props.lazy) {
    scrollRoot.value = findScrollParent(container.value)
    const { stop } = useIntersectionObserver(container, ([entry]) => {
      if (entry?.isIntersecting) {
        seen.value = true
        stop()
      }
    }, { root: scrollRoot, rootMargin: LAZY_MARGIN })
  }
})

// LOADING

let loadId = 0
let pendingLoad: UncachedImageLoad | undefined
// Object URL of an uncached image: this component owns it, so it frees it.
let ownedUrl: string | undefined

function releaseImage() {
  pendingLoad?.cancel()
  pendingLoad = undefined
  if (ownedUrl) {
    URL.revokeObjectURL(ownedUrl)
    ownedUrl = undefined
  }
}

function show(id: number, url: string | undefined, owned: boolean) {
  if (id !== loadId) {
    // Superseded by a newer load
    if (owned && url) {
      URL.revokeObjectURL(url)
    }
    return
  }
  if (owned) {
    ownedUrl = url
  }
  image.value = url
  emit('image-loaded')
}

function load() {
  const id = ++loadId
  releaseImage()
  image.value = undefined
  imageLoaded.value = false
  if (!props.slide || !viewWidth.value || !viewHeight.value || !seen.value) {
    return
  }
  const imageName = props.slide.imageName
  console.log('loading image: ', props.slide.uid, imageName, viewWidth.value, viewHeight.value)
  if (props.cached) {
    // Picks up the prefetched image, or fetches it right away if it is not there yet.
    imageCacheStore.waitForImage(imageName, viewWidth.value, viewHeight.value, true).then((url) => show(id, url, false))
    imageCacheStore.getImage(imageName, true, viewWidth.value, viewHeight.value).then((url) => show(id, url, false))
  } else {
    pendingLoad = imageCacheStore.loadUncached(imageName, viewWidth.value, viewHeight.value)
    pendingLoad.promise
      .then((url) => show(id, url, true))
      .catch((e) => console.error('Image load failed', imageName, e))
  }
}

// A plain watch, not watchEffect: the cache state read while loading must not trigger reloads.
watch([() => props.slide?.imageName, viewWidth, viewHeight, seen], load, { immediate: true })

onBeforeUnmount(() => {
  loadId++
  releaseImage()
})

</script>

<style scoped>

.cont {
  position: relative;
  width: 100%;
  height: 100%;
}

.top {
  z-index: 3000;
}

/* Over the image, not above it: in the flow it pushed the image a full height down, out of view,
   and v-img (unless eager) only loads once it is in view, so the image never appeared. */
.loading {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>
