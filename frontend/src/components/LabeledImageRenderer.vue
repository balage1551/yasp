<template>
  <div class="cont" :style="containerStyle" v-bind="props">
    <div v-if="!imageLoaded" class="mr-2 loading" >
      <v-progress-circular
        class="justify-center"
        indeterminate
        color="white"></v-progress-circular>
    </div>
    <v-img v-if="slide" ref="imageTag" :src="image" alt="slideInfo.imageName" aspect-ratio="1"  :draggable="false" @load="imageLoaded = true"></v-img>
    <label-handler v-if="imageLoaded && labelToRender" :image="imageTag" :label="labelToRender"></label-handler>
    <slot class="top"></slot>
  </div>
</template>
<script setup lang="ts">

import { VImg, VProgressCircular } from 'vuetify/components'
import { ImageSlide, LabelInfo } from '@/entities/SlideShowTypes'
import { computed, ref, watchEffect } from 'vue'
import LabelHandler from '@/components/LabelHandler.vue'
import useResourceApi from '@/api/resourceApi'

const props = withDefaults(defineProps<{
  slide: ImageSlide,
  width?: number,
  height?: number,
  label?: LabelInfo | undefined
  background?: string
}>(), {
  width: 1920,
  height: 1080,
  label: undefined,
  background: '#333333'
})

const imageTag = ref<HTMLImageElement | undefined>()
const image = ref<string | Blob | undefined>(undefined)
const imageLoaded = ref(false)
const labelToRender = computed(() => {
  return props.label ?? props.slide.label
})

const containerStyle = computed(() => {
  return {
    width: (props.width) + 'px',
    height: props.height + 'px',
    backgroundColor: props.background
  }
})

watchEffect(() => {
  if (props.slide) {
    image.value = undefined
    imageLoaded.value = false
    useResourceApi().requestThumbnail(props.slide.imageName, props.width, props.height).then((url) => {
      image.value = URL.createObjectURL(url)
    })
  }
})

</script>

<style scoped>

.cont {
  position: relative;
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
