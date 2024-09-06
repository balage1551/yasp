<template>
  <v-dialog width="1000" v-model="isOpen" >
    <v-card class="bg-black">
      <v-card-title >
        <v-icon class="mr-2">
          mdi-image
        </v-icon>
        {{ $t( 'labelEditor.title') }}
      </v-card-title>
      <v-card-text >
        <div class="container">
          <v-img v-if="slide" ref="imageTag" :src="image" alt="slideInfo.imageName" class="image" @load="imageLoaded = true"></v-img>
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
          <v-row>
            {{ label }}
          </v-row>
        </v-container>
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
  VSelect,
  VCardActions,
  VCardText,
  VCardTitle,
  VCheckbox,
  VCol,
  VContainer,
  VDialog,
  VIcon,
  VImg,
  VRow,
  VSpacer,
  VTextField
} from 'vuetify/components'
import { LabelInfo, Slide } from '@/entities/SlideShowTypes'
import { computed, ref, watchEffect } from 'vue'
import useResourceApi from '@/api/resourceApi'
import { labelStyles } from '@/entities/SlideShowUtils'
import { useSlideStore } from '@/stores/slideStore'
import LabelHandler from '@/components/LabelHandler.vue'

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

function open(s : Slide) {
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

  isOpen.value = true
  useResourceApi().requestImage(s.imageName).then(response => {
    image.value = URL.createObjectURL(response)
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
</style>
