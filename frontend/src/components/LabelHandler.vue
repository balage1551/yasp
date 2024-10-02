<template>
  <div v-if="image.image">
    <div ref="labelText" class="label" :style="labelStyles">
      <span v-for="(line,i) in labelLines" :key="i">{{ line }}<br/></span>
    </div>
<!--    <div style="position: fixed; background-color: white; color: black; z-index: 2000; right: 20px; top: 50px; width: 300px;">-->
<!--      {{ labelSize.width }} x {{ labelSize.height }} <br/>-->
<!--      {{ imageSize.width }} x {{ imageSize.height }} <br/>-->
<!--      {{ naturalSize.width }} x {{ naturalSize.height }} <br/>-->
<!--      {{ scaleLevel }} <br/>-->
<!--      {{ imageOrigin.x }} x {{ imageOrigin.y }} <br/>-->
<!--      {{ currentSize.width }} x {{ currentSize.height }} <br/>-->

<!--    </div>-->
  </div>
<!--  <v-textarea hide-details style="background-color: white; color:black; position: absolute; z-index: 2000; left: 20px; bottom: 20px; width: 1000px;"-->
<!--              v-model="localLabelAsString" @keyup.ctrl.enter="update"></v-textarea>-->
</template>
<script setup lang="ts">

import { VImg } from 'vuetify/components'
import { LabelInfo, OutlineStyle } from '@/entities/SlideShowTypes'
import { computed, onMounted, ref, watchPostEffect } from 'vue'
import { useElementSize } from '@vueuse/core'
import { useSlideStore } from '@/stores/slideStore'

const props = withDefaults(defineProps<{
  label: LabelInfo
  image: VImg
}>(), {
})

const defaults = ref(useSlideStore().labelDefaults)

const labelText = ref<HTMLElement | null>(null)
const labelLines = computed(() => localLabel.value?.text?.split('|'))
const labelSize = useElementSize(labelText)
const localLabel = ref<LabelInfo>()
const localLabelAsString = ref<string>()
watchPostEffect(() => {
  localLabel.value = props.label
  localLabelAsString.value = JSON.stringify(props.label)
})

const imageTag = ref<HTMLImageElement | undefined>()

onMounted(() => {
  imageTag.value = props.image.image
})

const imageSize = useElementSize(props.image)
const naturalSize = computed(() => {
  const img = imageTag.value
  return {
    width: img?.naturalWidth ?? 1,
    height: img?.naturalHeight ?? 1
  }
})
const scaleLevel = computed(() => {
  return Math.min(imageSize.width.value / naturalSize.value.width, imageSize.height.value / naturalSize.value.height)
})
const currentSize = computed(() => {
  return {
    width: naturalSize.value?.width * scaleLevel.value,
    height: naturalSize.value?.height * scaleLevel.value
  }
})
const imageOrigin = computed(() => {
  // console.log('imageSize: ', imageSize.value, ' naturalSize: ', naturalSize.value, ' scaleLevel: ', scaleLevel.value, outlineStyle.value)
  return {
    x: (imageSize.width.value - naturalSize.value.width * scaleLevel.value) / 2,
    y: (imageSize.height.value - naturalSize.value.height * scaleLevel.value) / 2
  }
})
//

function update() {
  localLabel.value = JSON.parse(localLabelAsString.value!) as LabelInfo
}

function transform(value: number | string, trim: number = 0): number {
  if (typeof value === 'number') {
    return value * scaleLevel.value
  } else {
    return parseFloat(value.substring(0, value.length - trim)) * scaleLevel.value
  }
}

const labelStyles = computed(() => {
  const styles = [fontSizeStyle.value, anchorXStyle.value, anchorYStyle.value, colorStyle.value, outlineStyle.value, alignmentStyle.value]
  // console.log('Combined label styles: ', combined)
  return styles.filter(item => item !== undefined && item.trim() !== '').join('; ')
})

const fontSizeStyle = computed(() => {
  const s = localLabel.value?.size ?? defaults.value.size ?? '5%'
  if (s?.endsWith('%')) {
    return `font-size: ${parseFloat(s.substring(0, s.length - 1)) * currentSize.value.height / 100}px`
  } else {
    return `font-size: ${parseFloat(s)}px`
  }
})

const alignmentStyle = computed(() => {
  const align = localLabel.value?.align ?? defaults.value.align ?? 'center'
  return `text-align: ${align}`
})

const anchorXStyle = computed(() => {
  const x = localLabel.value?.anchorX ?? defaults.value.anchorX ?? '50%'
  const align = localLabel.value?.align ?? defaults.value.align ?? 'center'
  let calcX : number
  if (x.endsWith('%')) {
    calcX = currentSize.value.width * parseFloat(x.substring(0, x.length - 1)) / 100
  } else {
    calcX = parseFloat(x)
  }
  if (align === 'center') {
    calcX -= labelSize.width.value / 2
  } else if (align === 'right') {
    calcX -= labelSize.width.value
  }
  calcX += imageOrigin.value.x
  return `left: ${calcX}px`
})

const anchorYStyle = computed(() => {
  const y = localLabel.value?.anchorY ?? defaults.value.anchorY ?? '10%'
  let calcY : number
  if (y.endsWith('%')) {
    calcY = currentSize.value.height * parseFloat(y.substring(0, y.length - 1)) / 100
  } else {
    calcY = parseFloat(y)
  }
  calcY += imageOrigin.value.y
  return `top: ${calcY}px`
})

const colorStyle = computed(() => {
  const color = localLabel.value?.color ?? defaults.value.color ?? '#ffffff'
  return `color: ${color}`
})

const outlineStyle = computed(() => {
  const outlined : OutlineStyle | undefined = (localLabel.value?.outlined === 'default' ? defaults.value.outlined : localLabel.value?.outlined) as (OutlineStyle | undefined)
  if (outlined === undefined) {
    return undefined
  }
  const color = outlined.color ?? '#000000'
  const width = outlined.width ?? 2
  return `text-shadow: -${width}px -${width}px 0 ${color}, ${width}px -${width}px 0 ${color}, -${width}px ${width}px 0 ${color}, ${width}px ${width}px 0 ${color}`
})

</script>

<style scoped>

.label {
  position: absolute;
  z-index: 2000;
}

</style>
