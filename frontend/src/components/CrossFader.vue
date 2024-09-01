<template>
  <div class="image-container">
    <image-holder :visible="flipFlop" :slide-info="slideInfo1" @image-loaded="swap">
    </image-holder>
    <image-holder :visible="!flipFlop" :slide-info="slideInfo2" @image-loaded="swap">
    </image-holder>
  </div>
</template>
<script setup lang="ts">

import { ImageSlideInfo } from '@/entities/ImageSlideInfo'
import { ref } from 'vue'
import ImageHolder from '@/components/ImageHolder.vue'

const props = withDefaults(defineProps<{
  dummy?: boolean
}>(), {
  dummy: true
})

const flipFlop = ref(true)

const slideInfo1 = ref<ImageSlideInfo | undefined>()
const slideInfo2 = ref<ImageSlideInfo | undefined>()

const pendingSwap = ref(false)

function setNext(info: ImageSlideInfo | undefined, flipImmediately: boolean = true) {
  if (flipFlop.value) {
    setImageInfo(slideInfo2, info, flipImmediately)
  } else {
    setImageInfo(slideInfo1, info, flipImmediately)
  }
}

function setImageInfo(slideInfo: Ref<ImageSlideInfo | undefined>, info: ImageSlideInfo | undefined, flipImmediately: boolean) {
  if (flipImmediately) {
    pendingSwap.value = true
  }
  if (slideInfo.value?.imageName === info?.imageName) {
    swap()
  } else {
    slideInfo.value = info
  }
}

function swap() {
  if (pendingSwap.value) {
    flipFlop.value = !flipFlop.value
    pendingSwap.value = false
  }
}

defineExpose({
  setNext
})

</script>

<style scoped>

</style>
