<template>
  <v-dialog width="1310" v-model="isOpen" >
    <v-card class="bg-black">
      <v-card-title >
        <v-icon class="mr-2">
          mdi-image
        </v-icon>
        {{ $t( 'labelEditor.title') }}
      </v-card-title>
      <v-card-text >
            <div style="width: 1000px;">
              <div class="container" @drop="patternDropped" @dragover="patternDragOver">
                <labeled-image-renderer v-if="slide" :slide="slide" :width="960" :height="540" :label="label"></labeled-image-renderer>
                <v-fab v-if="slideIndex > 0" variant="outlined" icon="mdi-chevron-left" class="navigator prev" absolute @click="move(-1)"  >
                </v-fab>
                <v-fab v-if="slideIndex < slides.length-1" variant="outlined" icon="mdi-chevron-right" class="navigator next" absolute @click="move(1)" >
                </v-fab>
              </div>
              <v-container fluid>

                <v-row>
                  <v-col cols="8">
                    <v-text-field
                      v-model="label.text"
                      :label="$t('labelEditor.text')"
                      variant="outlined"
                      hide-details
                      density="compact"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      v-model="label.size"
                      :label="$t('labelEditor.size')"
                      variant="outlined"
                      hide-details
                      density="compact"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="3">
                    <v-text-field
                      v-model="label.anchorY"
                      :label="$t('labelEditor.anchorY')"
                      variant="outlined"
                      hide-details
                      density="compact"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      v-model="label.anchorX"
                      :label="$t('labelEditor.anchorX')"
                      variant="outlined"
                      hide-details
                      density="compact"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      v-model="label.color"
                      :label="$t('labelEditor.color')"
                      variant="outlined"
                      hide-details
                      density="compact"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-select
                      v-model="label.align"
                      :label="$t('labelEditor.align')"
                      variant="outlined"
                      hide-details
                      density="compact"
                      :items="['left', 'center', 'right']"
                    ></v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="3">
                    <v-checkbox
                      v-model="isOutlined"
                      :label="$t('labelEditor.outlined')"
                      hide-details
                      density="compact"></v-checkbox>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-if="isOutlined && typeof label.outlined === 'object'"
                                  v-model="label.outlined!.width"
                                  :label="$t('labelEditor.outline.width')"
                                  variant="outlined"
                                  hide-details
                                  density="compact"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-if="isOutlined && typeof label.outlined === 'object'"
                                  v-model="label.outlined!.color"
                                  :label="$t('labelEditor.outline.color')"
                                  variant="outlined"
                                  hide-details
                                  density="compact"
                    ></v-text-field>
                  </v-col>
                </v-row>
<!--                <v-row>-->
<!--                  {{ label }}-->
<!--                </v-row>-->
              </v-container>
            </div>
            <div class="slidesWithLabel">
              <v-list class="list" v-for="slide in slidesWithLabel" :key="slide.uid">
                <v-list-item class="list">
                  <labeled-image-renderer :slide="slide" :width="240" :height="135" :background="slides.includes(slide) ? '#113169' : undefined"
                                          :label="slides.includes(slide) ? label : undefined"
                                          :draggable="true" @dragstart="patternDragStart($event, slide)" @dragend="patternDragEnd"
                  >
                    <v-icon v-if="slides.includes(slide) && slide.label" class="label-alert">mdi-alert-rhombus</v-icon>
                  </labeled-image-renderer>
                </v-list-item>
              </v-list>
            </div>
      </v-card-text>
      <v-card-actions class="pt-2 bg-grey-darken-4">
        <v-btn
          color="red"
          variant="flat"
          @click="remove">
          {{$t('labelEditor.remove')}}
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          variant="flat"
          color="primary"
          @click="save">
          {{$t('labelEditor.save')}}
        </v-btn>
      </v-card-actions>
    </v-card>

  </v-dialog>
</template>
<script setup lang="ts">

import {
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VCardTitle,
  VCheckbox,
  VCol,
  VContainer,
  VDialog,
  VFab,
  VIcon,
  VList,
  VListItem,
  VRow,
  VSelect,
  VSpacer,
  VTextField
} from 'vuetify/components'
import { ImageSlide, LabelInfo, SlideShow } from '@/entities/SlideShowTypes'
import { computed, nextTick, ref, watch, watchEffect } from 'vue'
import { useSlideStore } from '@/stores/slideStore'
import LabeledImageRenderer from '@/components/LabeledImageRenderer.vue'

const emit = defineEmits(['close'])

const isOpen = ref(false)

watch(isOpen, (v) => {
  if (!v) {
    slideIndex.value = -1
    emit('close')
  }
})

const slides = ref<ImageSlide[]>([])
const slideIndex = ref(-1)
const slide = computed(() => slides.value[slideIndex.value]) // ref<ImageSlide | undefined>(undefined)
const label = ref<LabelInfo>({ text: '', size: '5%' })

const isOutlined = ref(false)
const slidesWithLabel = ref<ImageSlide[]>([])

watchEffect(() => {
  if (isOutlined.value) {
    const dol = slide.value?.label?.outlined
    if (dol !== undefined) {
      if (typeof dol === 'object') {
        label.value.outlined = { ...dol }
      } else {
        label.value.outlined = 'default'
      }
    } else {
      label.value.outlined = useSlideStore().labelDefaults.outlined
    }
  } else {
    delete label.value.outlined
  }
})

function open(s : ImageSlide | ImageSlide[], slideShow: SlideShow) {
  console.log('open', s)
  const slideList = s instanceof Array ? s : [s]
  const slideUid = slideList.map((s) => s.uid)
  slidesWithLabel.value = slideShow.slides
    .flatMap((s) => s.type === 'group' ? s.slides : [s])
    .filter((sl) => slideUid.includes((sl as ImageSlide).uid) || sl.label !== undefined) as ImageSlide[]

  slides.value = slideList
  slideIndex.value = slideList.findIndex((s) => s.label !== undefined)
  if (slideIndex.value === -1) {
    slideIndex.value = 0
  }
  // const slide = slides.value[slideIndex.value]
  nextTick(() => {
    console.log('slideIndex.value', slideIndex.value, slide.value)
    isOutlined.value = slide.value.label?.outlined !== undefined
    label.value = slide.value?.label
      ? { ...slide.value.label }
      : {
          text: 'szöveg',
          size: '5%',
          anchorX: '50%',
          anchorY: '10%',
          align: 'center',
          color: '#ffffff',
          outlined: {
            color: '#000000',
            width: 2
          }
        }
    isOpen.value = true
  })
}

function move(delta : number) {
  slideIndex.value += delta
}

function save() {
  slides.value.forEach((s) => {
    s.label = { ...label.value }
  })
  isOpen.value = false
}

function remove() {
  slides.value.forEach((s) => {
    delete s.label
  })
  isOpen.value = false
}

const draggedSlide = ref<ImageSlide | undefined>()

function patternDragStart(event: DragEvent, slide: ImageSlide) {
  draggedSlide.value = slide
  event.dataTransfer?.setData('text/plain', 'pattern')
}

function patternDragEnd(event: DragEvent) {
  draggedSlide.value = undefined
}

function patternDragOver(event: DragEvent) {
  event.preventDefault()
}

function patternDropped(event: DragEvent) {
  const data = event.dataTransfer?.getData('text/plain')
  if (data === 'pattern' && draggedSlide.value) {
    const droppedLabel = draggedSlide.value.label!
    const currentText = label.value.text
    label.value = { ...droppedLabel }
    if (!event.ctrlKey) {
      label.value.text = currentText
    }
    isOutlined.value = label.value.outlined !== undefined
  }
}

defineExpose({
  open
})

</script>

<style scoped>

.container {
  position: relative;
  width: 960px;
  height: 540px;
  background-color: #333333;
}

.image {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.title {
  z-index: 1;
  position: absolute;
}

.list {
  background-color: #222222 !important;
  margin: 0;
  padding: 0.2em;
}

.slidesWithLabel {
  position:absolute;
  top: 0;
  right: 0;
  width: 290px;
  height: calc(100% - 52px);
  background-color: #222222 !important;
  border-bottom: 1px solid #000000;
  overflow-y: auto;
}

.navigator {
  position: absolute;
  z-index: 2000;
  top: -260px;
  color: #666666;
}

.navigator:hover {
  color: #aaaaaa;
}

.prev {
  left: 60px;
}

.next {
  right: 10px;
}

.label-alert {
  position: absolute;
  bottom:5px;
  left: 5px;
  color: #de6464;
}
</style>
