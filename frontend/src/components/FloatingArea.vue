<template>
  <div ref="container" :style="style" style="position: fixed; " v-bind="props">
    <slot></slot>
  </div>
</template>
<script setup lang="ts">

import { Ref, ref, watch, watchEffect } from 'vue'
import { Optional } from '@/utils/typeScriptUtils'
import { debouncedRef, useDraggable, useLocalStorage, useWindowSize } from '@vueuse/core'
import { Bound } from '@/components/FloatingAreaTypes'

const props = withDefaults(defineProps<{
  initX?: number,
  initY?: number,
  persistenceKey?: Optional<string>,
  horizontalBound?: Bound,
  verticalBound?: Bound,
}>(), {
  initX: 0,
  initY: 0,
  persistenceKey: undefined,
  horizontalBound: 'nearest',
  verticalBound: 'nearest'
})

const container = ref<HTMLDivElement>()

const { x, y, style } = useDraggable(container, {
  initialValue: { x: props.initX, y: props.initY },
  capture: true,
  preventDefault: true,
  stopPropagation: true
})

if (props.persistenceKey) {
  const storageX = useLocalStorage(props.persistenceKey + '-x', props.initX)
  const storageY = useLocalStorage(props.persistenceKey + '-y', props.initY)
  x.value = storageX.value
  y.value = storageY.value
  const persistX = debouncedRef(x, 50)
  const persistY = debouncedRef(y, 50)
  watchEffect(() => { storageX.value = persistX.value })
  watchEffect(() => { storageY.value = persistY.value })
}

const { width: screenWidth, height: screenHeight } = useWindowSize()

watch(screenWidth, (n : number, o : number) => {
  bound(props.horizontalBound, x, container.value?.offsetWidth ?? 0, o, n)
})

watch(screenHeight, (n : number, o : number) => {
  bound(props.verticalBound, y, container.value?.offsetHeight ?? 0, o, n)
})

function bound(bound: Bound, position : Ref<number>, itemWidth: number, oldDimension: number, newDimension: number) {
  const itemStart = position.value
  let newStart = itemStart
  if (container.value) {
    if (newDimension <= itemWidth) {
      newStart = -(itemWidth - newDimension) / 2
    } else {
      const itemEnd = oldDimension - itemStart - itemWidth
      const delta = newDimension - oldDimension
      // console.log(`Screen resized from ${o} to ${n} (delta: ${delta}. Item constraints: ${itemLeft} - ${itemWidth} - ${itemRight}`)
      let side = bound
      if (side === 'nearest') {
        const center = itemStart + itemWidth / 2
        if (center <= oldDimension / 3) {
          side = 'start'
        } else if (center <= 2 * oldDimension / 3) {
          side = 'proportional'
        } else {
          side = 'end'
        }
      }
      if (side === 'end') {
        newStart += delta
      } else if (side === 'center') {
        newStart += Math.round(delta / 2)
      } else if (side === 'proportional') {
        if (itemStart + itemEnd !== 0) {
          newStart += delta * (itemStart / (itemStart + itemEnd))
        }
      }
    }

    // console.log(`New position: ${newLeft} (from ${itemLeft}, side: ${side})`)
    if (newStart !== itemStart) {
      position.value = newStart
    }
  }
}

</script>

<style scoped>

</style>
