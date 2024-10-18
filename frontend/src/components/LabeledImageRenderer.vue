<template>
  <div class="cont" :style="containerStyle" v-bind="props">
    <div v-if="!imageLoaded" class="mr-2 loading" >
      <v-progress-circular
        class="justify-center"
        indeterminate
        color="white"></v-progress-circular>
    </div>
    <v-img v-if="slide" ref="imageTag"  :style="containerStyle" :src="image" alt="slideInfo.imageName" aspect-ratio="1"  :draggable="false" @load="imageLoaded = true" ></v-img>
    <label-handler v-if="imageLoaded && labelToRender" :image="imageTag" :label="labelToRender"></label-handler>
    <slot class="top"></slot>
  </div>
</template>
<script setup lang="ts">

import { VImg, VProgressCircular } from 'vuetify/components'
import { ImageSlide, LabelInfo } from '@/entities/SlideShowTypes'
import { computed, ref, watchEffect } from 'vue'
import LabelHandler from '@/components/LabelHandler.vue'
import { useWindowSize } from '@vueuse/core'
import { useImageCache } from '@/stores/imageCacheStore'

const props = withDefaults(defineProps<{
  slide: ImageSlide,
  width?: number,
  height?: number,
  label?: LabelInfo | undefined
  background?: string,
  cached?: boolean
}>(), {
  width: undefined,
  height: undefined,
  label: undefined,
  background: '#333333',
  cached: false
})

const imageCacheStore = useImageCache()

const imageTag = ref<HTMLImageElement | undefined>()
const image = ref<string | Blob | undefined>(undefined)
const imageLoaded = ref(false)
const labelToRender = computed(() => {
  return props.label ?? props.slide.label
})
const windowSize = useWindowSize()

const viewWidth = computed(() => props.width ?? windowSize.width.value)
const viewHeight = computed(() => props.height ?? windowSize.height.value)

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

watchEffect(() => {
  if (props.slide && viewWidth.value && viewHeight.value) {
    console.log('loading image: ', props.slide, props.slide.imageName, viewWidth.value, viewHeight.value)
    image.value = undefined
    imageLoaded.value = false
    imageCacheStore.getImage(props.slide.imageName, props.cached, viewWidth.value, viewHeight.value).then((url) => {
      image.value = url
      emit('image-loaded')
    })
  }
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

.loading {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
}

</style>
