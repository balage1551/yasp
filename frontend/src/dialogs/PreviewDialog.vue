<template>
  <v-dialog :model-value="visible" :width="width + 10" >
    <v-card class="bg-black pa-0 ma-0">
      <v-card-text class="pa-1 ma-0" >
        <labeled-image-renderer :slide="slide!" :width="width" :height="height" @click="emit('close')"></labeled-image-renderer>
      </v-card-text>
    </v-card>

  </v-dialog>
</template>
<script setup lang="ts">

import { VCard, VCardText, VDialog } from 'vuetify/components'
import { ImageSlide } from '@/entities/SlideShowTypes'
import { computed } from 'vue'
import LabeledImageRenderer from '@/components/LabeledImageRenderer.vue'
import { useWindowSize } from '@vueuse/core'

const previewRatio = 0.8

const emit = defineEmits(['close'])

const screenSize = useWindowSize()
const width = computed(() => screenSize.width.value * previewRatio)
const height = computed(() => screenSize.height.value * previewRatio)

const props = defineProps<{
  slide: ImageSlide | undefined
}>()

const visible = computed(() => !!props.slide)

</script>

<style scoped>

</style>
