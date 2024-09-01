<template>
  <div class="container">
    <v-expand-transition>
      <div v-show="visible" class="content" :style="contentStyle">
      <slot></slot>
    </div>
    </v-expand-transition>
    <div class="bar" :style="barStyle">
    </div>
    <div class="handle d-flex justify-center align-center" :style="handleStyle" @click="toggle">
      <slot name="handle">
        <v-icon v-if="icon" :color="color" size="40" :icon="icon"></v-icon>
      </slot>
    </div>
  </div>
</template>
<script setup lang="ts">

import { VExpandTransition, VIcon } from 'vuetify/components'
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  bgColor?: string,
  barHeight?: string,
  handlePosition?: 'left' | 'right',
  icon?: string,
  color?: string
}>(), {
  bgColor: '#4f72c0',
  barHeight: '5px',
  handlePosition: 'left',
  icon: 'mdi-chevron-down',
  color: 'white',
})

const barStyle = computed(() => {
  return 'height: ' + props.barHeight + '; background-color: ' + props.bgColor + ';'
})

const handleStyle = computed(() => {
  return 'background-color: ' + props.bgColor + ';' + (props.handlePosition === 'left' ? 'left: 0.25em;' : 'right: 0.25em;')
})

const contentStyle = computed(() => {
  return 'background-color: ' + props.bgColor + '; color: ' + props.color + ';'
})

const visible = ref(false)

function hide() {
  visible.value = false
}

function show() {
  visible.value = true
}

function toggle() {
  visible.value = !visible.value
}

defineExpose({ hide, show, toggle })

const beforeEnter = (el : HTMLDivElement) => {
  console.log('BE')
  el.style.maxHeight = '0'
}

const enter = (el : HTMLDivElement) => {
  console.log('E')
  el.style.maxHeight = el.scrollHeight + 'px'
}

const leave = (el : HTMLDivElement) => {
  console.log('L')
  el.style.maxHeight = '0'
}

</script>

<style scoped>

.container {
  width: 100%;
  position: fixed;
  z-index: 1000;
  padding: 0;
}

.bar {
  width: 100%;
  position: relative;
  bottom: 0;
}

.handle {
  position: absolute;
  padding: 0 5px 5px 5px;
  border-bottom-left-radius: 0.25em;
  border-bottom-right-radius: 0.25em;
}

</style>
