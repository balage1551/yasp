<template>
  <div class="stack" :class="{ 'fade-in': visible, 'fade-out': !visible }" v-bind="props">
    <template v-if="slideInfo ">
      <labeled-image-renderer :slide="slideInfo" :width="windowSize.width.value" :cached="props.cached" :lazy="false" :height="windowSize.height.value" @image-loaded="emit('image-loaded')"></labeled-image-renderer>
    </template>
<!--    <template v-else>-->
<!--      <v-img ref="imageTag" v-if="slideInfo" :src="image" alt="slideInfo.imageName" class="image" @load="imageLoaded = true"></v-img>-->
<!--    </template>-->
  </div>
</template>
<script setup lang="ts">

import { ImageSlide, type LabelInfo } from '@/entities/SlideShowTypes'
import { ref } from 'vue'
import LabeledImageRenderer from '@/components/LabeledImageRenderer.vue'
import { useWindowSize } from '@vueuse/core'
import { useImageCache } from '@/stores/imageCacheStore'

const props = withDefaults(defineProps<{
  slideInfo: ImageSlide | undefined
  visible?: boolean
  cached?: boolean
}>(), {
  visible: true,
  cached: false
})

const imageCacheStore = useImageCache()

// const image = ref()
// const imageTag = ref<VImg>()
// const imageLoaded = ref(false)
const label = ref<LabelInfo|undefined>(undefined)
const windowSize = useWindowSize()

const emit = defineEmits<{(e: 'image-loaded'): void
}>()

// watchEffect(async () => {
//   if (props.slideInfo === undefined) {
//     image.value = undefined
//     label.value = undefined
//   } else {
//     image.value = await imageCacheStore.getImage(props.slideInfo.imageName, props.cached)
//     label.value = props.slideInfo.label
//     await nextTick(() => {
//       emit('image-loaded')
//     })
//   }
// })

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
