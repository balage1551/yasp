<template>
  <div class="container" style="position: relative;">
    <cross-fader ref="crossFader"></cross-fader>
<!--    <v-icon v-if="state === SlideShowState.HOLD_ON_BLOCK_END" class="icon paused-block-end" size="50">mdi-pause</v-icon>-->
    <v-icon v-if="state === SlideShowState.HOLD_ON_SLIDE" class="icon paused-slide" size="50">mdi-pause</v-icon>
    <v-icon v-if="state === SlideShowState.MANUAL_HOLD" class="icon paused-manual" size="50">mdi-pause</v-icon>
    <v-icon v-if="state === SlideShowState.FINISHED" class="icon finished" size="50">mdi-square</v-icon>
    <v-progress-linear class="progress" height="8px" :max="total" :model-value="progress"></v-progress-linear>
    <div class="infoBox text-left" v-if="showInfo">
      {{ currentSlide?.imageName }} ({{ currentSlide?.index }} of {{ total }}) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br/>
      {{ state }} <br/>
      {{ currentSlide?.group ? 'Group' : ''}}
    </div>
  </div>
</template>
<script setup lang="ts">

import { VIcon, VProgressLinear } from 'vuetify/components'
import { ImageSlide, Slide, SlideShow } from '@/entities/SlideShowTypes'
import { onMounted, ref } from 'vue'
import CrossFader from '@/components/CrossFader.vue'
import { SlideShowRunner, SlideShowState } from '@/entities/SlideShowRunner'
import { useEventListener } from '@vueuse/core'

const props = withDefaults(defineProps<{
  slideShow: SlideShow
}>(), {})

const emit = defineEmits<{(e: 'finished'): void
}>()

const crossFader = ref<typeof CrossFader>()
const state = ref<SlideShowState>()
const total = ref(0)
const progress = ref(0)
const currentSlide = ref<ImageSlide | undefined>()
const showInfo = ref(true)

onMounted(() => {
  const show = new SlideShowRunner(props.slideShow,
    (si) => {
      swap(si)
    },
    (state: SlideShowState) => {
      setOsdIcon(state)
    })
  total.value = show.slideShow.totalSlides
  useEventListener(window, 'keydown', (event) => {
    if (event.key === 'i') {
      showInfo.value = !showInfo.value
    }
  })
  show.start()
})

function swap(si: ImageSlide | undefined) {
  currentSlide.value = si
  crossFader.value?.setNext(si)
  progress.value = si?.index ?? 0
}

function setOsdIcon(s: SlideShowState) {
  state.value = s
  if (s === SlideShowState.FINISHED) {
    emit('finished')
  }
}

</script>

<style scoped>

.icon {
  z-index: 1000;
  position: fixed;
  left: 20px;
  top: 20px;
  text-shadow: -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000;
}

.paused-block-end {
  color: yellow;
}

.paused-slide {
  color: orange;
}

.paused-manual {
  color: red;
}

.finished {
  color: green;
}

.progress {
  position: absolute;
  top: calc(100vh - 10px) !important;
  left: 0;
  width: 100%;
  height: 10px;
  z-index: 1000;
  color: #004b9a;
}

.infoBox {
  position: absolute;
  top: 15px;
  right: 20px;
  z-index: 1000;
  color: #aaaaaa;
  background-color: #55555580;
  padding: 2px 5px;
}

</style>
