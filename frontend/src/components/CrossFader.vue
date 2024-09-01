<template>
  <div class="image-container">
    <image-holder :visible="flipFlop" :slide-info="slideInfo1" @image-loaded="swap">
    </image-holder>
    <image-holder :visible="!flipFlop" :slide-info="slideInfo2" @image-loaded="swap">
    </image-holder>
  </div>
</template>
<script setup lang="ts">

import { Slide } from '@/entities/SlideShowTypes'
import { Ref, ref } from 'vue'
import ImageHolder from '@/components/ImageHolder.vue'

const props = withDefaults(defineProps<{
  dummy?: boolean
}>(), {
  dummy: true
})

const flipFlop = ref(true)

const slideInfo1 = ref<Slide | undefined>()
const slideInfo2 = ref<Slide | undefined>()

const pendingSwap = ref(false)

function setNext(info: Slide | undefined, flipImmediately: boolean = true) {
  if (flipFlop.value) {
    setImageInfo(slideInfo2, info, flipImmediately)
  } else {
    setImageInfo(slideInfo1, info, flipImmediately)
  }
}

function setImageInfo(slideInfo: Ref<Slide | undefined>, info: Slide | undefined, flipImmediately: boolean) {
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
