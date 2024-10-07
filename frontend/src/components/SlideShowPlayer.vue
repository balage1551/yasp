<template>
  <div class="container" ref="screen" style="position: relative;">
    <cross-fader ref="crossFader"></cross-fader>
    <v-icon v-if="state === SlideShowState.HOLD_ON_SLIDE" class="icon paused-slide" size="50">mdi-mouse</v-icon>
    <v-icon v-if="state === SlideShowState.MANUAL_HOLD" class="icon paused-manual" size="50">mdi-pause</v-icon>
    <v-icon v-if="state === SlideShowState.FINISHED" class="icon finished" size="50">mdi-square</v-icon>
    <v-icon v-if="slideShowRunner?.currentSlide?.value?.type === 'group'" class="loopIcon" size="40">mdi-sync</v-icon>
    <slide-show-progress v-if="slideShowRunner" :slide-show-runner="slideShowRunner"></slide-show-progress>
    <div class="infoBox text-left" v-if="showInfo">
      {{ currentSlide?.imageName }} ({{ fullIndex(currentSlide) }} of {{ total }}) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br/>
      {{ state }} <br/>
    </div>
    <v-card ref="controlPanel" variant="flat" class="pa-2 control-panel" :style="cpStyle" :disabled="cpPhase !== 'static'" @click.prevent.stop>
      <v-btn v-if="state !== SlideShowState.MANUAL_HOLD" variant="flat" color="primary" class="control-panel-button" @click.stop="sendKey('Pause')"  >
        <v-icon class="control-panel-icon" >
          mdi-pause
        </v-icon>
      </v-btn>
      <v-btn v-if="state === SlideShowState.MANUAL_HOLD" variant="flat" color="primary" class="control-panel-button" @click.stop="sendKey('Space')"  >
        <v-icon class="control-panel-icon" >
          mdi-play
        </v-icon>
      </v-btn>
      <v-btn variant="flat" color="primary" class="control-panel-button" :disabled="(slideShowRunner?.currentSlideIndex.value ?? 0) === 0" @click.stop="sendKey('ArrowLeft')"  >
        <v-icon class="control-panel-icon" >
          mdi-eye-arrow-left
        </v-icon>
      </v-btn>
      <v-btn variant="flat" color="primary" class="control-panel-button" :disabled="(slideShowRunner?.currentSlideIndex.value ?? 0) === (slideShow?.slides.length-1)"  @click.stop="sendKey('ArrowRight')"  >
        <v-icon class="control-panel-icon" >
          mdi-eye-arrow-right
        </v-icon>
      </v-btn>
      <v-btn variant="flat" color="error" class="control-panel-button" @click.stop="handleKey('Escape')"  >
        <v-icon class="control-panel-icon" >
          mdi-close
        </v-icon>
      </v-btn>
    </v-card>
    <div v-if="showHelp" class="keyboard-help">
      <div class="center">
        <div class="float-start kbc-button mr-2">Space</div>
        vagy
        <div class="ml-2 float-start kbc-button mr-5">Enter</div>
        <span> Lejátszás közben kép léptetése</span>
      </div>
      <div class="center">
        <div class="float-start kbc-button mr-5">P</div>
        <span> Vetítés megállítása</span>
      </div>
      <div class="center">
        <div class="float-start kbc-button mr-5">←</div>
        <span> Vetítés megállítása és visszalépés</span>
      </div>
      <div class="center">
        <div class="float-start kbc-button mr-5">→</div>
        <span> Vetítés megállítása és előrelépés</span>
      </div>
      <div class="center">
        <div class="float-start kbc-button mr-5">Space</div>
        <span> Megállított vetítés újraindítása</span>
      </div>
      <div class="center">
        <div class="float-start kbc-button mr-5">Esc</div>
        <span> Megszakítja a vetítést (kétszer, gyorsan lenyomva)</span>
      </div>
      <div class="center">
        <div class="float-start kbc-button mr-5">I</div>
        <span> Dia információk megjelenítése és elrejtése</span>
      </div>
      <div class="center">
        <div class="float-start kbc-button mr-5">C</div>
        <span> Vezérlőbillentyűk megjelenítése</span>
      </div>
      <div class="center">
        <div class="float-start kbc-button mr-5">F1</div>
        <span> Ez a súgó megjelenítése és elrejtése</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">

import { VBtn, VCard, VIcon } from 'vuetify/components'
import { ImageSlide, SlideShow } from '@/entities/SlideShowTypes'
import { computed, onMounted, ref, shallowRef, StyleValue, watchEffect } from 'vue'
import CrossFader from '@/components/CrossFader.vue'
import { SlideShowRunner, SlideShowState } from '@/entities/SlideShowRunner'
import {
  useElementSize,
  useEventListener,
  useFullscreen,
  usePointerSwipe,
  useScreenOrientation,
  UseSwipeDirection,
  useWindowSize
} from '@vueuse/core'
import { fullIndex } from '@/entities/SlideShowUtils'
import SlideShowProgress from '@/components/SlideShowProgress.vue'
import { UseDeviceOrientation } from '@vueuse/components'

const props = withDefaults(defineProps<{
  slideShow: SlideShow
}>(), {})

const { enter: enterFullScreen } = useFullscreen()

const emit = defineEmits<{(e: 'finished'): void }>()

const crossFader = ref<typeof CrossFader>()
const state = ref<SlideShowState>()
const total = ref(0)
const progress = ref(0)
const currentSlide = ref<ImageSlide | undefined>()
const showInfo = ref(false)
const showHelp = ref(false)
const slideShowRunner = shallowRef<SlideShowRunner>()
const escapePressed = ref(false)
const screen = ref<HTMLDivElement>()

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

function sendKey(code: string) {
  console.log('sendKey', code)
  slideShowRunner.value?.handleKey(code)
}

onMounted(() => {
  const show = new SlideShowRunner(props.slideShow,
    (si) => {
      swap(si)
    },
    (state: SlideShowState) => {
      setOsdIcon(state)
    })
  slideShowRunner.value = show
  total.value = show.slideShow.slides.length
  useEventListener(window, 'keydown', (e) => {
    if (handleKey(e.key)) {
      e.preventDefault()
    }
  })
  enterFullScreen()
  show.start()
})

function handleKey(code: string) {
  console.log('handleKey', code)
  if (code === 'i') {
    showInfo.value = !showInfo.value
  } if (code === 'c') {
    cpOpacity.value = 1
    cpLocation.value = cpLocation.value === 'hidden' ? 'bottom' : 'hidden'
    endSwipe()
    return true
  } else if (code === 'F1') {
    showHelp.value = !showHelp.value
    return true
  } else if (code === 'Escape') {
    if (escapePressed.value) {
      slideShowRunner.value?.stop()
      emit('finished')
    } else {
      escapePressed.value = true
      setTimeout(() => {
        escapePressed.value = false
      }, 1000)
    }
    return true
  }
  return false
}

// CONTROL PANEL
type ControlPanelLocation = 'top' | 'bottom' | 'left' | 'right' | 'hidden'

type ControlPanelPhase = 'showing' | 'hiding' | 'static'
const DISTANCE_FROM_EDGE = 40
const swipeStartFromEdge = computed(() => screenHeight.value * 0.1)

const RATION = 2
const controlPanel = ref<HTMLDivElement>()
const cpLocation = ref<ControlPanelLocation>('hidden')
const cpPhase = ref<ControlPanelPhase>('static')
const { width: cpWidth, height: cpHeight } = useElementSize(controlPanel)
const { width: screenWidth, height: screenHeight } = useWindowSize()
const maxSwipeY = computed(() => (cpHeight.value + DISTANCE_FROM_EDGE) * RATION)
const swipeOrigin = ref(0)

const lastSwipeDirection = ref<UseSwipeDirection>()

const { orientation } = useScreenOrientation()

const cpOpacity = ref(0)
const cpStartTop = computed(() => screenHeight.value) // -cpHeight.value)
const cpEndTop = computed(() => screenHeight.value - cpHeight.value - DISTANCE_FROM_EDGE)
const cpMaxMovement = computed(() => Math.abs((cpEndTop.value - cpStartTop.value) * RATION))
const cpTop = ref(0)

const cpLeft = ref(0)

const cpStyle = computed<StyleValue>(() => {
  // console.log('cpStyle', cpLocation.value, cpLocation.value !== 'hidden', cpTop.value, cpLeft.value, cpOpacity.value)
  return {
    visibility: (cpLocation.value !== 'hidden') ? 'visible' : 'hidden',
    top: cpTop.value + 'px',
    left: cpLeft.value + 'px',
    opacity: cpOpacity.value,
  }
})

watchEffect(() => {
  if (orientation.value === UseDeviceOrientation.PORTRAIT) {
    cpLeft.value = ((screenWidth.value - cpWidth.value) / 2)
  } else {
    cpLeft.value = ((screenWidth.value - cpWidth.value) / 2)
  }
  if (cpLocation.value === 'bottom') {
    cpTop.value = screenHeight.value - (cpHeight.value + DISTANCE_FROM_EDGE)
  }
})

const { direction, isSwiping, distanceY, posStart } = usePointerSwipe(
  screen,
  {
    onSwipe() {
      // console.log('swipe', isSwiping.value, direction.value)
      if (cpPhase.value !== 'static' && direction.value !== lastSwipeDirection.value) {
        endSwipe()
      }
      if (isSwiping.value) {
        if (cpLocation.value === 'hidden') {
          cpOpacity.value = 0
          // if (direction.value === 'down' && posStart.y < swipeStartFromEdge.value) {
          //   cpLocation.value = 'top'
          //   cpPhase.value = 'showing'
          //   swipeOrigin.value = distanceY.value
          //   lastSwipeDirection.value = direction.value
          // }
          if (direction.value === 'up' && posStart.y > screenHeight.value - swipeStartFromEdge.value) {
            cpLocation.value = 'bottom'
            cpPhase.value = 'showing'
            swipeOrigin.value = distanceY.value
            lastSwipeDirection.value = direction.value
          }
        // } else if (cpLocation.value === 'top' && cpPhase.value === 'static') {
        //   if (direction.value === 'up') {
        //     cpPhase.value = 'hiding'
        //     swipeOrigin.value = distanceY.value
        //     lastSwipeDirection.value = direction.value
        //   }
        } else if (cpLocation.value === 'bottom' && cpPhase.value === 'static') {
          if (direction.value === 'down') {
            cpPhase.value = 'hiding'
            swipeOrigin.value = distanceY.value
            lastSwipeDirection.value = direction.value
          }
        }
      }
    },
    onSwipeEnd() {
      endSwipe()
    },
  })

function endSwipe() {
  // console.log('swipe end', cpOpacity.value)
  if (cpOpacity.value < 0.9) {
    console.log('hide')
    cpLocation.value = 'hidden'
  } else {
    // if (cpLocation.value === 'top') {
    //   cpTop.value = DISTANCE_FROM_EDGE
    // }
    if (cpLocation.value === 'bottom') {
      cpTop.value = screenHeight.value - (cpHeight.value + DISTANCE_FROM_EDGE)
    }
  }
  cpPhase.value = 'static'
  cpOpacity.value = 1
}

watchEffect(() => {
  if (isSwiping.value) {
    // if (cpLocation.value === 'top' && cpPhase.value !== 'static') {
    //   // const delta =
    //   const delta = swipeOrigin.value - distanceY.value
    //   const calculatedTop = (direction.value === 'down' ? cpStartTop.value + delta / RATION : cpEndTop.value + delta / RATION)
    //   cpLeft.value = ((screenWidth.value - cpWidth.value) / 2)
    //   cpTop.value = Math.min(Math.max(calculatedTop, cpStartTop.value), cpEndTop.value)
    //   cpOpacity.value = (cpTop.value - cpStartTop.value) / cpMaxMovement.value * RATION
    //   // console.log('delta', `so: ${swipeOrigin.value}  ly: ${distanceY.value}   d: ${delta}   ct: ${calculatedTop} st: ${cpStartTop.value}  et: ${cpEndTop.value}   mm: ${cpMaxMovement.value}   top: ${cpTop.value}  op: ${cpOpacity.value}`)
    // }
    if (cpLocation.value === 'bottom' && cpPhase.value !== 'static') {
      // const delta =
      const delta = swipeOrigin.value - distanceY.value
      const calculatedTop = (direction.value === 'up' ? cpStartTop.value + delta / RATION : cpEndTop.value + delta / RATION)
      cpLeft.value = ((screenWidth.value - cpWidth.value) / 2)
      cpTop.value = Math.max(Math.min(calculatedTop, cpStartTop.value), cpEndTop.value)
      cpOpacity.value = Math.abs(cpTop.value - cpStartTop.value) / cpMaxMovement.value * RATION
      // console.log('delta', `so: ${swipeOrigin.value}  ly: ${distanceY.value}   d: ${delta}   ct: ${calculatedTop} st: ${cpStartTop.value}  et: ${cpEndTop.value}   mm: ${cpMaxMovement.value}   top: ${cpTop.value}  op: ${cpOpacity.value}`)
    }
  }
})

</script>

<style scoped>

.icon {
  z-index: 1000;
  position: fixed;
  left: 20px;
  top: 20px;
  text-shadow: -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000;
}

.loopIcon {
  z-index: 1000;
  position: fixed;
  left: 80px;
  top: 25px;
  color: #415494;
  text-shadow: -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000;
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

.infoBox {
  position: absolute;
  top: 15px;
  right: 20px;
  z-index: 1000;
  color: #aaaaaa;
  background-color: #55555580;
  padding: 2px 5px;
}

.keyboard-help {
  position: fixed;
  bottom: 30px;
  left: 20px;
  z-index: 1000;
  color: #ffffff;
  background-color: #55555580;
  padding: 10px;
}

.center {
  display: flex;
  align-items: center;
  margin-bottom: 1em;
}

.control-panel {
  z-index: 5000;
  position: absolute;
  background-color: #1a1a1a;
}

.control-panel-button {
  height: 3rem;
}

.control-panel-button:not(:first-of-type) {
  margin-left: 0.5em;
}

.control-panel-icon {
  font-size: 2rem;
}

</style>
