<template>
  <v-dialog width="1300" v-model="isOpen" >
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
                <v-img v-if="slide" ref="imageTag" @drop="patternDropped" :src="image" alt="slideInfo.imageName" class="image" @load="imageLoaded = true"></v-img>
                <label-handler v-if="imageLoaded" :image="imageTag" :label="label"></label-handler>
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
                  <labeled-image-renderer :slide="slide" :width="240" :height="135"
                                          :draggable="true" @dragstart="patternDragStart($event, slide)" @dragend="patternDragEnd"
                  ></labeled-image-renderer>
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
  VIcon,
  VImg,
  VList,
  VListItem,
  VRow,
  VSelect,
  VSpacer,
  VTextField
} from 'vuetify/components'
import { ImageSlide, LabelInfo, Slide, SlideShow } from '@/entities/SlideShowTypes'
import { ref, watch, watchEffect } from 'vue'
import useResourceApi from '@/api/resourceApi'
import { useSlideStore } from '@/stores/slideStore'
import LabelHandler from '@/components/LabelHandler.vue'
import LabeledImageRenderer from '@/components/LabeledImageRenderer.vue'

// const props = withDefaults(defineProps<{
// }>(), {
// })

const isOpen = ref(false)

const slide = ref<Slide | undefined>(undefined)
const image = ref()
const imageTag = ref<VImg>()
const imageLoaded = ref(false)
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

function open(s : ImageSlide, slideShow: SlideShow) {
  console.log('open', s)
  slidesWithLabel.value = slideShow.slides.flatMap((s) => s.type === 'group' ? s.slides : [s]).filter((sl) => (sl as ImageSlide).uid !== s.uid && sl.label !== undefined) as ImageSlide[]

  slide.value = s
  isOutlined.value = s.label?.outlined !== undefined
  label.value = s.label
    ? { ...s.label }
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

  useResourceApi().requestImage(s.imageName).then(response => {
    image.value = URL.createObjectURL(response)
    isOpen.value = true
  })
}

function save() {
  slide.value!.label = { ...label.value }
  isOpen.value = false
}

function remove() {
  delete slide.value!.label
  isOpen.value = false
}

const emit = defineEmits(['close'])

watch(isOpen, (v) => {
  if (!v) {
    emit('close')
  }
})

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
  width: 270px;
  height: calc(100% - 52px);
  background-color: #222222 !important;
  border-bottom: 1px solid #000000;
  overflow-y: auto;
}
</style>
