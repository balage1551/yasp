<template>
  <div class="cont" :style="containerStyle">
    <v-img v-if="slide" ref="imageTag" :src="image" alt="slideInfo.imageName"  :draggable="false" @load="imageLoaded = true"></v-img>
    <label-handler v-if="imageLoaded" :image="imageTag" :label="slide.label!"></label-handler>
  </div>
</template>
<script setup lang="ts">

import { VImg } from 'vuetify/components'
import { ImageSlide } from '@/entities/SlideShowTypes'
import { computed, ref, watchEffect } from 'vue'
import LabelHandler from '@/components/LabelHandler.vue'
import useResourceApi from '@/api/resourceApi'

const props = withDefaults(defineProps<{
  slide: ImageSlide,
  width?: number,
  height?: number
}>(), {
  width: 1920,
  height: 1080
})

const imageTag = ref<HTMLImageElement | undefined>()
const image = ref<string | Blob | undefined>(undefined)
const imageLoaded = ref(false)

const containerStyle = computed(() => {
  return {
    width: (props.width) + 'px',
    height: props.height + 'px',
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
  background-color: #333333;
}

.label {
  position: absolute;
  z-index: 2000;
}

</style>
