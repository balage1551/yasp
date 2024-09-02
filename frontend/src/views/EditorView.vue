<template>
  <application-layout>

    <v-container fluid class="pa-0 ma-0 ">
      <v-sheet ref="header" class="header" variant="elevated">
        <v-container class="ma-0">
          <v-row>
            <v-col cols="4">
              <v-text-field variant="outlined" v-model="editorStore.path" :label="$t('editor.directory')"
                            prepend-inner-icon="mdi-folder" hide-details readonly>
                <template #append>
                  <v-btn color="primary" @click="scan">Scan</v-btn>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="1">
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>
      <v-sheet ref="reel" class="reel" variant="elevated" :style="boxHeight">
        <v-container>

        </v-container>
        <v-list v-if="slideShow" class="reel-list" v-model:opened="openedBlocks">
          <v-list-group v-for="block in slideShow.blocks" :key="block.uid" :value="block.uid">
            <template v-slot:activator="{props}">
              <v-list-item
                v-bind="props"
              >
                <v-container @click.stop="">
                  <v-row>
                    <v-col cols="6">
                      <v-text-field v-model="block.name" :label="$t('editor.block.name')" hide-details density="compact" variant="outlined">
                        <template #prepend>
                          <div class="block-index">
                            {{ block.index}} - {{ block.uid }}
                          </div>
                        </template>
                      </v-text-field>
                    </v-col>
                    <v-col cols="1">
                      <v-menu :id="'atTheEndMenu-'+block.uid" location="bottom" @click.stop="">
                        <template v-slot:activator="{ props }">
                          <v-icon v-if="block.atTheEnd?.type === 'hold'" size="32" class="mt-1" v-bind="props">mdi-mouse</v-icon>
                          <v-icon v-else-if="block.atTheEnd?.type === 'loop'" class="mt-1" size="32" v-bind="props">mdi-repeat-variant</v-icon>
                          <v-icon v-else size="32" class="mt-1" v-bind="props">mdi-arrow-right-thick</v-icon>
                        </template>
                        <v-list>
                          <v-list-item prepend-icon="mdi-arrow-right-thick" @click="setAtTheEnd(block, 'continue')">
                            <v-list-item-title >{{  $t('editor.atTheEnd.continue') }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item prepend-icon="mdi-mouse" @click="setAtTheEnd(block, 'hold')">
                            <v-list-item-title >{{  $t('editor.atTheEnd.hold') }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item prepend-icon="mdi-repeat-variant" @click="setAtTheEnd(block, 'loop')">
                            <v-list-item-title >{{  $t('editor.atTheEnd.loop') }}</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </v-col>
                    <v-col cols="5" class="text-right" >
                        <v-icon v-if="block.index !== 1" size="40" @click="mergeUp(block)">mdi-arrow-expand-up</v-icon>
                    </v-col>
                  </v-row>
                </v-container>
              </v-list-item>
            </template>

            <v-list-item v-for="slide in block.slides" :key="slide.absoluteIndex" class="my-1 slide-box">
              <template #prepend>
                <v-img class="mr-2 thumbnail" style="width: 120px; height: 80px; background-color: #0d0d0d;"
                       :src="slide.thumbnail" aspect-ratio="1"></v-img>
              </template>
              <template #append>
                <v-icon size="40">mdi-tag-edit</v-icon>
                <v-icon size="40">mdi-transition-masked</v-icon>
                <v-icon size="40" @click="splitBlock(block, slide)">mdi-arrow-split-horizontal</v-icon>
                <div style="width: 10px"></div>
                <v-icon size="40">mdi-delete</v-icon>

              </template>
              <v-list-item-title class="font-weight-bold mb-2">
                {{ slide.inBlockIndex }} - {{ slide.imageName }}
              </v-list-item-title>
              <v-list-item-subtitle>
                <v-icon :style="'color:'+ (slide.label ? 'white' : 'gray')">mdi-tag</v-icon>
                <v-icon :style="'color:'+ ((slide.trigger?.type === 'key') ? 'white' : 'gray')">mdi-mouse</v-icon>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list-group>
        </v-list>
      </v-sheet>
      <v-sheet ref="bucket" class="bucket" variant="elevated" :style="boxHeight">
        <v-container class="ma-0">
          <v-row>
            <v-col cols="4">
              BUCKET
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>
    </v-container>
  </application-layout>

</template>
<script setup lang="ts">

import {
  VBtn,
  VCol,
  VContainer,
  VIcon,
  VImg,
  VList,
  VListGroup,
  VListItem,
  VListItemSubtitle,
  VListItemTitle,
  VMenu,
  VRow,
  VSheet,
  VTextField
} from 'vuetify/components'
import { computed, onMounted, Ref, ref, watchEffect } from 'vue'
import ApplicationLayout from '@/layouts/ApplicationLayout.vue'
import { Slide, SlideShowBlock, SlideShowInfo } from '@/entities/SlideShowTypes'
import useEditorApi from '@/api/editorApi'
import { useElementSize, useWindowSize } from '@vueuse/core'
import { useEditorStore } from '@/stores/editorStore'
import useResourceApi from '@/api/resourceApi'
import { nextUID } from '@/entities/SlideShowUtils'

const editorApi = useEditorApi()
const resourceApi = useResourceApi()
const editorStore = useEditorStore()

const slideShow: Ref<SlideShowInfo> = ref({ blocks: [], totalSlides: 0 })
const header = ref()

const headerSize = useElementSize(header)
const windowSize = useWindowSize()

const boxHeight = computed(() => {
  return 'height:' + (windowSize.height.value - headerSize.height.value) + 'px'
})

const openedBlocks = ref<number[]>([])

onMounted(async () => {
  console.log('editorStore', editorStore.slideShow)
  if (editorStore.slideShow == null) {
    await editorStore.setCurrentSlideShow('gallery/test', 'test')
  }
  slideShow.value = editorStore.slideShow
  console.log('slideShow', slideShow.value)
  if (slideShow.value) {
    openedBlocks.value.slice(0, openedBlocks.value.length)
    slideShow.value.blocks.forEach((block) => {
      openedBlocks.value.push(block.uid)
      block.slides.forEach((slide) => {
        if (slide.thumbnail === undefined) {
          resourceApi.requestThumbnail(slide.imageName).then((response) => {
            slide.thumbnail = URL.createObjectURL(response)
          })
        }
      })
    })
  }
})

function scan() {
  console.log('scan', editorStore.path)
  editorApi.scanDirectory(editorStore.path).then((response) => {
    console.log('scan response', response)
    if (response.successful) {
      const slideImageNames = slideShow.value.blocks.flatMap((block) => block.slides).map((slide) => slide.imageName)
      const newBlock: SlideShowBlock = { slides: [], index: slideShow.value.blocks.length + 1 }
      slideShow.value.blocks.push(newBlock)
      response.images?.forEach((file) => {
        console.log('file', file)
        if (!slideImageNames.some((s) => s === file.fileName)) {
          newBlock.slides.push({
            imageName: file.fileName,
            blockIndex: newBlock.index,
            inBlockIndex: newBlock.slides.length + 1,
            block: newBlock
          })
        }
      })
    }
  })
}

function setAtTheEnd(block: SlideShowBlock, type: 'continue' | 'hold' | 'loop') {
  block.atTheEnd = { type }
}

function indexOfBlock(block: SlideShowBlock) {
  return slideShow.value.blocks.indexOf(block)
}

function mergeUp(block: SlideShowBlock) {
  const ss = slideShow.value
  const i = indexOfBlock(block)
  const prevBlock = ss.blocks[i - 1]
  block.slides.forEach((s) => {
    prevBlock.slides.push(s)
    s.block = prevBlock
    s.blockIndex = prevBlock.index
    s.inBlockIndex = prevBlock.slides.length
  })
  ss.blocks.splice(i, 1)
  for (let p = i; p < ss.blocks.length; p++) {
    ss.blocks[p].index = p + 1
  }
  const obidx = openedBlocks.value.indexOf(block.uid)
  if (obidx !== -1) {
    openedBlocks.value.splice(obidx, 1)
  }
}

function splitBlock(block: SlideShowBlock, slide: Slide) {
  const ss = slideShow.value
  const i = indexOfBlock(block)
  const newBlock: SlideShowBlock = { slides: [], index: i + 1, uid: nextUID() }
  ss.blocks.splice(i + 1, 0, newBlock)
  let ibi = 1
  const startIndex = slide.inBlockIndex - 1
  for (let p = startIndex; p < block.slides.length; p++) {
    const s = block.slides[p]
    s.inBlockIndex = ibi++
    s.block = newBlock
    s.blockIndex = newBlock.index
    newBlock.slides.push(s)
  }
  block.slides.splice(startIndex, block.slides.length)
  for (let p = i; p < ss.blocks.length; p++) {
    ss.blocks[p].index = p + 1
  }
  openedBlocks.value.push(newBlock.uid)
}

watchEffect(() => {
  console.log('OB', [...openedBlocks.value])
})

</script>

<style scoped>

.header {
  background-color: #202872;
  color: whitesmoke;
}

.reel {
  position: absolute;
  background-color: #333333;
  width: 50%;
  color: whitesmoke;
  overflow-y: auto;
}

.bucket {
  position: absolute;
  background-color: #333333;
  border-left: 1px solid whitesmoke;
  width: 50%;
  left: 50%;
  color: whitesmoke;
}

.reel-list {
  text-align: left;
  margin: 2px 5px;
  background-color: #0d0d0d !important;
}

.reel-list-item {
}

.slide-show-info-title {
  background-color: #8689ea;
  color: whitesmoke;
}

.slides-title {
  background-color: #8689ea;
  color: whitesmoke;
}

.slide-box {
  height: 90px;
  background-color: #555555;
  margin: 2px 10px;
}

.thumbnail {
  border: 1px solid #aaaaaa;
}

.block-index {
  font-size: 120%;
  font-weight: bold;
}

</style>
