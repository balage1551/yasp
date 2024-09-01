<template>
  <v-range-slider
    density="compact"
    v-model="range"
    color="white"
    :max="10"
    :min="-30"
    :step="1"
    hide-details
    class="align-center"
  >
    <template v-slot:prepend>
      <v-icon v-if="icon" size="40" :icon="icon"></v-icon>
      <v-text-field
        v-model="tempLowRange"
        hide-details
        hide-spin-buttons
        single-line
        type="number"
        variant="outlined"
        density="compact"
        style="width: 50px"
        @blur="checkPastValue"
        @keyup.enter.prevent="checkPastValue"
      ></v-text-field>
    </template>
    <template v-slot:append>
      <v-text-field
        v-model="tempHighRange"
        hide-details
        hide-spin-buttons
        single-line
        type="number"
        variant="outlined"
        style="width: 50px"
        density="compact"
        @blur="checkFutureValue"
        @keyup.enter.prevent="checkFutureValue"
      ></v-text-field>
    </template>
  </v-range-slider>

</template>
<script setup lang="ts">

import { VIcon, VRangeSlider, VTextField } from 'vuetify/components'
import { ref, watchEffect } from 'vue'
import { boundNumber, Optional } from '@/utils/typeScriptUtils'
import { useVModels } from '@vueuse/core'

const props = withDefaults(defineProps<{
  minValue?: number,
  maxValue?: number,
  min: number,
  max: number,
  minThreshold?: number,
  maxThreshold?: number,
  icon?: Optional<string>
}>(), {
  minThreshold: 0,
  maxThreshold: 0
})

// eslint-disable-next-line vue/valid-define-emits
const emit = defineEmits()

const { minValue, maxValue } = useVModels(props, emit)

const range = ref<number[]>([minValue.value ?? props.min, maxValue.value ?? props.max])
const tempLowRange = ref(-range.value[0])
const tempHighRange = ref(range.value[1])

watchEffect(() => {
  range.value[0] = minValue.value ?? props.min
}, { flush: 'post' })

watchEffect(() => {
  range.value[1] = maxValue.value ?? props.max
}, { flush: 'post' })

watchEffect(() => {
  range.value[0] = Math.min(range.value[0], props.minThreshold)
  tempLowRange.value = -range.value[0]
  emit('update:minValue', range.value[0])

  range.value[1] = Math.max(range.value[1], props.maxThreshold)
  tempHighRange.value = range.value[1]
  emit('update:maxValue', range.value[1])
})

function checkPastValue() {
  tempLowRange.value = boundNumber(tempLowRange.value, Math.abs(props.minThreshold), Math.abs(props.min))
  range.value[0] = -tempLowRange.value
}

function checkFutureValue() {
  tempHighRange.value = boundNumber(tempHighRange.value, props.maxThreshold, props.max)
  range.value[1] = tempHighRange.value
}

</script>

<style scoped>

</style>
