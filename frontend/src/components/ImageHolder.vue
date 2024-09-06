<template>
  <div class="stack" :class="{ 'fade-in': visible, 'fade-out': !visible }" v-bind="props">
    <v-img ref="imageTag" v-if="slideInfo" :src="image" alt="slideInfo.imageName" class="image" @load="imageLoaded = true"></v-img>
    <label-handler v-if="label && imageLoaded" :image="imageTag" :label="label"></label-handler>
<!--    <div class="title" v-if="slideInfo?.label">-->
<!--      <div :style="labelStyle">{{slideInfo.label.text}}</div>-->
<!--    </div>-->
  </div>
</template>
<script setup lang="ts">

import { VImg } from 'vuetify/components'
import { type LabelInfo, Slide } from '@/entities/SlideShowTypes'
import { computed, nextTick, ref, watchEffect } from 'vue'
import useResourceApi from '@/api/resourceApi'
import { useSlideStore } from '@/stores/slideStore'
import { labelStyles } from '@/entities/SlideShowUtils'
import LabelHandler from '@/components/LabelHandler.vue'

const props = withDefaults(defineProps<{
  slideInfo: Slide | undefined
  visible?: boolean
}>(), {
  visible: true
})

const resourceApi = useResourceApi()
const slideStore = useSlideStore()

const image = ref()
const imageTag = ref<VImg>()
const imageLoaded = ref(false)
const label = ref<LabelInfo|undefined>(undefined)

const emit = defineEmits<{(e: 'image-loaded'): void
}>()

watchEffect(async () => {
  if (props.slideInfo === undefined) {
    image.value = undefined
    label.value = undefined
  } else {
    const response = await resourceApi.requestImage(props.slideInfo.imageName)
    image.value = URL.createObjectURL(response)
    label.value = props.slideInfo.label
    await nextTick(() => {
      emit('image-loaded')
    })
  }
})

const labelStyle = computed(() => {
  return labelStyles(label.value, slideStore.labelDefaults)
})

</script>

<style scoped>

.image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.stack {
  width: 100vw;
  height: 100vh;
  object-fit: contain;
  position: absolute;
  background-color: #333333;
  transition: opacity 0.5s ease-in-out;
}

.title {
  z-index: 1;
  position: absolute;
}

.fade-in {
  opacity: 1;
  z-index: 1;
}

.fade-out {
  opacity: 0;
  z-index: 0;
}
</style>
