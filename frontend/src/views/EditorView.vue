<template>
  <application-layout>

    <v-container fluid class="pa-0 ma-0 ">
      <v-card class="slide-show-info">
        <v-card-title class="slide-show-info-title">
          {{ $t('editor.title') }}
        </v-card-title>
        <v-card-text class="slide-show-info-details">
          <v-container>
            <v-row>
              <v-col cols="5">
                <v-text-field variant="outlined" v-model="directory" :label="$t('editor.directory')"
                              prepend-inner-icon="mdi-folder">
                  <template #append>
                    <v-btn color="primary" @click="scan">Scan</v-btn>
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="1">
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
      <v-card class="slides">
        <v-card-title class="slide-show-info-title">
          {{ $t('editor.slides') }}
        </v-card-title>
        <v-card-text class="slide-show-info-details">
          <block-editor v-for="b in slideShow.blocks" :key="b.index"  :block="b"></block-editor>
        </v-card-text>
      </v-card>
    </v-container>
  </application-layout>

</template>
<script setup lang="ts">

import { VBtn, VCard, VCardText, VCardTitle, VCol, VContainer, VRow, VTextField } from 'vuetify/components'
import { Ref, ref } from 'vue'
import ApplicationLayout from '@/layouts/ApplicationLayout.vue'
import { SlideShowBlock, SlideShowInfo } from '@/entities/SlideShowTypes'
import useEditorApi from '@/api/editorApi'
import BlockEditor from '@/components/BlockEditor.vue'

const slideShow: Ref<SlideShowInfo> = ref({ blocks: [], totalSlides: 0 })

const directory = ref('gallery/test')

const editorApi = useEditorApi()

function scan() {
  console.log('scan', directory)
  editorApi.scanDirectory(directory.value).then((response) => {
    console.log('scan response', response)
    if (response.successful) {
      const slideImageNames = slideShow.value.blocks.flatMap((block) => block.slides).map((slide) => slide.imageName)
      const newBlock : SlideShowBlock = { slides: [], index: slideShow.value.blocks.length + 1 }
      slideShow.value.blocks.push(newBlock)
      response.images?.forEach((file) => {
        console.log('file', file)
        if (!slideImageNames.some((s) => s === file.fileName)) {
          newBlock.slides.push({ imageName: file.fileName, blockIndex: newBlock.index, inBlockIndex: newBlock.slides.length + 1, block: newBlock })
        }
      })
    }
  })
}

</script>

<style scoped>

.slide-show-info, .slides {
  margin: 20px 10px;
}

.slide-show-info-title {
  background-color: #8689ea;
  color: whitesmoke;
}

.slides-title {
  background-color: #8689ea;
  color: whitesmoke;
}

</style>
