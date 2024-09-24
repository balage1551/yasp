<template>
  <div class="container" >
    <div class="stripe behind" :style="'width: '+(behindSlides * slideWidth)+'px;' "></div>
    <div class="stripe current" :style="'width: '+(slideWidth)+'px;' ">
      <div class="stripe focus" :style="'width: '+(currentSlideWidth)+'px; margin-left: '+currentSlidePosition+'px;' ">
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">

import { GroupSlide } from '@/entities/SlideShowTypes'
import { SlideShowRunner } from '@/entities/SlideShowRunner'
import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'

const props = withDefaults(defineProps<{
  slideShowRunner: SlideShowRunner
}>(), {})

const totalSlides = computed(() => props.slideShowRunner.slideShow.slides.length)
const windowSize = useWindowSize()
const slideWidth = computed(() => windowSize.width.value / totalSlides.value)
const behindSlides = computed(() => Math.max(0, props.slideShowRunner.currentSlideIndex.value))
const currentSlideWidth = computed(() => {
  if (props.slideShowRunner.currentSlide.value?.type === 'image') {
    return slideWidth.value
  } else {
    return slideWidth.value / (props.slideShowRunner.currentSlide.value as GroupSlide).slides.length
  }
})
const currentSlidePosition = computed(() => {
  if (props.slideShowRunner.currentSlide.value?.type === 'image') {
    return 0
  } else {
    return props.slideShowRunner.currentInGroupIndex.value * currentSlideWidth.value
  }
})

</script>

<style scoped>

.container {
  position: absolute;
  top: calc(100vh - 10px) !important;
  left: 0;
  width: 100%;
  height: 10px;
  z-index: 1000;
  color: white;
  background-color: #0f1d2d;
}

.stripe {
  float: left;
  height: 100%;
}

.behind {
  background-color: #152967;
}

.current {
  background-color: #3052c2;
}

.focus {
  background-color: #ab994d;
}

</style>
