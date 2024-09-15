<template>
  <application-layout>

    <v-container fluid class="pa-0 ma-0 ">
      <v-sheet ref="header" class="header px-2 " variant="elevated">
        <v-container fluid class="ma-0">
          <v-row>
            <v-col cols="4">
              <v-text-field variant="outlined" v-model="editorStore.path" :label="$t('editor.directory')"
                            prepend-inner-icon="mdi-folder" hide-details readonly>
                <template #append>
                  <v-btn color="primary" @click="scan">Scan</v-btn>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field variant="outlined" v-model="editorStore.name" :label="$t('editor.name')"
                            hide-details>
              </v-text-field>
            </v-col>
            <v-col cols="3">
            </v-col>
            <!--            <v-col cols="1" class="text-right" >-->
            <!--              <v-btn class="mt-2" color="primary" @click="save">{{ $t('common.save' )}}</v-btn>-->
            <!--            </v-col>-->
          </v-row>
        </v-container>
      </v-sheet>
      <v-toolbar density="compact" class="reel-toolbar px-2" ref="reelToolbar">
        <div class="info ml-2">
          {{ $t('editor.info', {totalCount: slideShow.totalSlides, topSlides: slideShow.slides.length}) }}
        </div>
        <v-spacer></v-spacer>
        <!--          <v-icon size="32" @click="addBlock">mdi-folder-plus</v-icon>-->
      </v-toolbar>
      <v-sheet ref="reel" class="reel" variant="elevated" :style="boxHeight">

        <v-list v-if="slideShow" class="reel-list" v-model:opened="openedGroups" ref="dropZone">
          <template v-for="slide in slideShow.slides" :key="slide.uid">

            <!-- Pre main slide marker -->
            <div class="drag-marker"
                 :class="{ 'drag-marker-visible' : isDragTargetSelected( slide, undefined ) }"
                 @dragenter="handleSlideDragEnter($event, slide, true)"
                 @dragleave="handleSlideDragLeave($event, true)"
                 @drop="drop($event, dragTarget)"
                 @dragover.prevent>

            </div>

            <!-- Main slide -->
            <v-list-item v-if="slide.type === 'image'" class="slide-box"
                         :class="{ 'selected': reelSelectedItems.includes(slide) }"
                         style="border-left: 2px solid transparent; "
                         @dragover.prevent
                         :draggable="true"
                         @click="reelSelectItem($event, slide)"
                         @dragenter="handleSlideDragEnter($event, slide)"
                         @dragleave="handleSlideDragLeave($event)"
                         @drop="drop($event, dragTarget)"

                         @dragstart="reelDragStart($event, slide)"
                         @dragend="dragEnd"
            >

              <template #prepend>
                <v-img class="mr-2 thumbnail" style="width: 120px; height: 80px; background-color: #0d0d0d;"
                       :src="slide.thumbnail" aspect-ratio="1"></v-img>
                <v-icon class="missing" size="60" v-if="slide.missing === true" color="red">mdi-alert</v-icon>
              </template>
              <template #append>
                <!--                                <v-icon size="40" @click="splitBlock(block, slide)">mdi-arrow-split-horizontal</v-icon>-->
                <!--                                <div style="width: 10px"></div>-->
                <!--                                <v-icon size="40" @click="deleteSlide(slide)">mdi-delete</v-icon>-->

              </template>
              <v-list-item-title class="font-weight-bold mb-2">
                {{ slide.index }} - {{ slide.imageName }}
              </v-list-item-title>
              <v-list-item-subtitle>
                <!--                                <v-icon @click="editLabel(slide)" :style="'color:'+ (slide.label ? 'white' : 'gray')">mdi-tag</v-icon>-->
                <!--                                <v-menu :id="'trigger-'+slide.imageName" location="bottom" @click.stop="">-->
                <!--                                  <template v-slot:activator="{ props }">-->
                <!--                                    <v-icon v-bind="props" v-if="!slide.trigger || slide.trigger.type === 'timed'">mdi-timer</v-icon>-->
                <!--                                    <v-icon v-bind="props" v-else-if="slide.trigger.type === 'key' && slide.trigger.onlyOnce !== true">mdi-keyboard</v-icon>-->
                <!--                                    <v-icon v-bind="props" v-else>mdi-keyboard-outline</v-icon>-->
                <!--                                  </template>-->
                <!--                                  <v-list>-->
                <!--                                    <v-list-item prepend-icon="mdi-timer" @click="setTransition(slide, 'continue')">-->
                <!--                                      <v-list-item-title>{{ $t('editor.transition.continue') }}</v-list-item-title>-->
                <!--                                    </v-list-item>-->
                <!--                                    <v-list-item prepend-icon="mdi-keyboard" @click="setTransition(slide, 'hold')">-->
                <!--                                      <v-list-item-title>{{ $t('editor.transition.hold') }}</v-list-item-title>-->
                <!--                                    </v-list-item>-->
                <!--                                    <v-list-item prepend-icon="mdi-keyboard-outline" @click="setTransition(slide, 'holdOnce')">-->
                <!--                                      <v-list-item-title>{{ $t('editor.transition.holdOnce') }}</v-list-item-title>-->
                <!--                                    </v-list-item>-->
                <!--                                  </v-list>-->
                <!--                                </v-menu>-->
              </v-list-item-subtitle>
            </v-list-item>

            <!-- Group slide -->
            <v-list-group v-else class="group-container" :value="slide.uid">
              <template v-slot:activator="{props}">
                <v-list-item v-bind="props"
                             :class="{ 'selected-group-head': reelSelectedItems.includes(slide) }"
                             class="group-head"
                             @dragover.prevent
                             :draggable="true"
                             @dragenter="handleSlideDragEnter($event, slide)"
                             @dragleave="handleSlideDragLeave($event)"
                             @drop="drop($event, dragTarget)"
                             @dragstart="reelDragStart($event, slide)"
                             @dragend="dragEnd"
                >
                  <v-container @click.stop="reelSelectItem($event, slide)"

                  >
                    <v-row>
                      <v-col cols="6">
                        <v-text-field v-model="(slide as GroupSlide).name" :label="$t('editor.block.name')" hide-details
                                      density="compact"
                                      @click.stop
                                      variant="outlined">
                          <template #prepend>
                            <div class="block-index">
                              {{ slide.index }} ({{ (slide as GroupSlide).slides.length }})
                            </div>
                          </template>
                        </v-text-field>
                      </v-col>

                    </v-row>
                  </v-container>
                </v-list-item>
              </template>

              <template v-for="inGroupSlide in (slide as GroupSlide).slides" :key="inGroupSlide.uid">

                <!-- Group slide item pre marker -->
                <div class="drag-marker"
                     :class="{ 'drag-marker-in-group-visible' : isDragTargetSelected( inGroupSlide, slide as GroupSlide) }"
                     @dragenter="handleSlideDragEnter($event, inGroupSlide, true)"
                     @dragleave="handleSlideDragLeave($event, true)"
                     @drop="drop($event, dragTarget)"
                     @dragover.prevent>
                </div>

                <!-- Group slide item -->
                <v-list-item v-if="inGroupSlide.type === 'image'" class="slide-box group-slide"
                             :class="{ 'selected-group-slide': reelSelectedItems.includes(inGroupSlide) }"
                             @dragover.prevent
                             @click="reelSelectItem($event, inGroupSlide)"
                             :draggable="true"
                             @dragenter="handleSlideDragEnter($event, inGroupSlide)"
                             @dragleave="handleSlideDragLeave($event)"
                             @drop="drop($event, dragTarget)"

                             @dragstart="reelDragStart($event, inGroupSlide)"
                             @dragend="dragEnd"
                >

                  <template #prepend>
                    <v-img class="mr-2 thumbnail" style="width: 120px; height: 80px; background-color: #0d0d0d;"
                           :src="inGroupSlide.thumbnail" aspect-ratio="1"></v-img>
                    <v-icon class="missing" size="60" v-if="inGroupSlide.missing === true" color="red">mdi-alert</v-icon>
                  </template>
                  <template #append>
                    <!--                                <v-icon size="40" @click="splitBlock(block, slide)">mdi-arrow-split-horizontal</v-icon>-->
                    <!--                                <div style="width: 10px"></div>-->
                    <!--                                <v-icon size="40" @click="deleteSlide(slide)">mdi-delete</v-icon>-->

                  </template>
                  <v-list-item-title class="font-weight-bold mb-2">
                    {{ inGroupSlide.index }} - {{ inGroupSlide.imageName }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    <!--                                <v-icon @click="editLabel(slide)" :style="'color:'+ (slide.label ? 'white' : 'gray')">mdi-tag</v-icon>-->
                    <!--                                <v-menu :id="'trigger-'+slide.imageName" location="bottom" @click.stop="">-->
                    <!--                                  <template v-slot:activator="{ props }">-->
                    <!--                                    <v-icon v-bind="props" v-if="!slide.trigger || slide.trigger.type === 'timed'">mdi-timer</v-icon>-->
                    <!--                                    <v-icon v-bind="props" v-else-if="slide.trigger.type === 'key' && slide.trigger.onlyOnce !== true">mdi-keyboard</v-icon>-->
                    <!--                                    <v-icon v-bind="props" v-else>mdi-keyboard-outline</v-icon>-->
                    <!--                                  </template>-->
                    <!--                                  <v-list>-->
                    <!--                                    <v-list-item prepend-icon="mdi-timer" @click="setTransition(slide, 'continue')">-->
                    <!--                                      <v-list-item-title>{{ $t('editor.transition.continue') }}</v-list-item-title>-->
                    <!--                                    </v-list-item>-->
                    <!--                                    <v-list-item prepend-icon="mdi-keyboard" @click="setTransition(slide, 'hold')">-->
                    <!--                                      <v-list-item-title>{{ $t('editor.transition.hold') }}</v-list-item-title>-->
                    <!--                                    </v-list-item>-->
                    <!--                                    <v-list-item prepend-icon="mdi-keyboard-outline" @click="setTransition(slide, 'holdOnce')">-->
                    <!--                                      <v-list-item-title>{{ $t('editor.transition.holdOnce') }}</v-list-item-title>-->
                    <!--                                    </v-list-item>-->
                    <!--                                  </v-list>-->
                    <!--                                </v-menu>-->
                  </v-list-item-subtitle>
                </v-list-item>
              </template>

              <!-- Group slide item post marker -->
              <div class="drag-marker"
                   :class="{ 'drag-marker-in-group-visible' : isDragTargetSelected( undefined, slide as GroupSlide) }"
                   @dragenter="handleSlideDragEnter($event, undefined, true)"
                   @dragleave="handleSlideDragLeave($event, true)"
                   @drop="drop($event, dragTarget)"
                   @dragover.prevent>
              </div>

            </v-list-group>
          </template>

          <div class="drag-marker"
               :class="{ 'drag-marker-visible' : isDragTargetSelected( undefined, undefined) }"
               @dragenter="handleSlideDragEnter($event, undefined, true)"
               @dragleave="handleSlideDragLeave($event,  true)"
               @drop="drop($event, dragTarget)"
               @dragover.prevent>
          </div>
          <!--            :class="{ 'drag-marker-visible' : isDragTargetSelected( block, slide) }"-->
          <!--            @dragenter="handleSlideDragEnter($event, block, slide, true)"-->
          <!--            @dragleave="handleSlideDragLeave($event,  true)"-->
          <!--            @drop="drop($event, dragTarget)"-->

          <!--            <v-list-group v-for="block in slideShow.blocks" :key="block.uid"-->
          <!--                          ref="reelBlocks"-->
          <!--                          :value="block.uid"-->
          <!--                          @dragenter="handleBlockDragEnter($event, block)"-->
          <!--                          @dragleave="handleBlockDragLeave($event, block)"-->
          <!--                          @drop="drop($event, dragTarget)"-->
          <!--                          @dragover.prevent>-->
          <!--              <template v-slot:activator="{props}">-->
          <!--                <v-list-item-->
          <!--                  v-bind="props"-->
          <!--                >-->
          <!--                  <v-container @click.stop="">-->
          <!--                    <v-row>-->
          <!--                      <v-col cols="6">-->
          <!--                        <v-text-field v-model="block.name" :label="$t('editor.block.name')" hide-details density="compact"-->
          <!--                                      variant="outlined">-->
          <!--                          <template #prepend>-->
          <!--                            <div class="block-index">-->
          <!--                              {{ block.index }} - {{ block.uid }}-->
          <!--                            </div>-->
          <!--                          </template>-->
          <!--                        </v-text-field>-->
          <!--                      </v-col>-->
          <!--                      <v-col cols="1">-->
          <!--                        <v-menu :id="'atTheEndMenu-'+block.uid" location="bottom" @click.stop="">-->
          <!--                          <template v-slot:activator="{ props }">-->
          <!--                            <v-icon v-if="block.atTheEnd?.type === 'hold'" size="32" class="mt-1" v-bind="props">-->
          <!--                              mdi-mouse-->
          <!--                            </v-icon>-->
          <!--                            <v-icon v-else-if="block.atTheEnd?.type === 'loop'" class="mt-1" size="32" v-bind="props">-->
          <!--                              mdi-repeat-variant-->
          <!--                            </v-icon>-->
          <!--                            <v-icon v-else size="32" class="mt-1" v-bind="props">mdi-arrow-right-thick</v-icon>-->
          <!--                          </template>-->
          <!--                          <v-list>-->
          <!--                            <v-list-item prepend-icon="mdi-arrow-right-thick" @click="setAtTheEnd(block, 'continue')">-->
          <!--                              <v-list-item-title>{{ $t('editor.atTheEnd.continue') }}</v-list-item-title>-->
          <!--                            </v-list-item>-->
          <!--                            <v-list-item prepend-icon="mdi-mouse" @click="setAtTheEnd(block, 'hold')">-->
          <!--                              <v-list-item-title>{{ $t('editor.atTheEnd.hold') }}</v-list-item-title>-->
          <!--                            </v-list-item>-->
          <!--                            <v-list-item prepend-icon="mdi-repeat-variant" @click="setAtTheEnd(block, 'loop')">-->
          <!--                              <v-list-item-title>{{ $t('editor.atTheEnd.loop') }}</v-list-item-title>-->
          <!--                            </v-list-item>-->
          <!--                          </v-list>-->
          <!--                        </v-menu>-->
          <!--                      </v-col>-->
          <!--                      <v-col cols="5" class="text-right">-->
          <!--                        <v-icon :disabled="block.index === 1" size="32" @click="mergeUp(block)">mdi-arrow-expand-up-->
          <!--                        </v-icon>-->
          <!--                      </v-col>-->
          <!--                    </v-row>-->
          <!--                  </v-container>-->
          <!--                </v-list-item>-->
          <!--              </template>-->

          <!--              <template v-for="slide in block.slides" :key="slide.absoluteIndex">-->
          <!--                <div class="drag-marker"-->
          <!--                     :class="{ 'drag-marker-visible' : isDragTargetSelected( block, slide) }"-->
          <!--                     @dragenter="handleSlideDragEnter($event, block, slide, true)"-->
          <!--                     @dragleave="handleSlideDragLeave($event,  true)"-->
          <!--                     @drop="drop($event, dragTarget)"-->
          <!--                     @dragover.prevent>-->

          <!--                </div>-->

          <!--                <v-list-item class="slide-box" :class="{ 'selected': reelSelectedItems.includes(slide) }"-->
          <!--                             :draggable="true"-->
          <!--                             @dragstart="reelDragStart($event, slide)"-->
          <!--                             @dragend="dragEnd"-->
          <!--                             @dragenter="handleSlideDragEnter($event, block, slide)"-->
          <!--                             @dragleave="handleSlideDragLeave($event)"-->
          <!--                             @drop="drop($event, dragTarget)"-->
          <!--                             @dragover.prevent-->
          <!--                             @click="reelSelectItem($event, slide)">-->
          <!--                  <template #prepend>-->
          <!--                    <v-img class="mr-2 thumbnail" style="width: 120px; height: 80px; background-color: #0d0d0d;"-->
          <!--                           :src="slide.thumbnail" aspect-ratio="1"></v-img>-->
          <!--                    <v-icon class="missing" size="60" v-if="slide.missing === true" color="red">mdi-alert</v-icon>-->
          <!--                  </template>-->
          <!--                  <template #append>-->
          <!--                    <v-icon size="40" @click="splitBlock(block, slide)">mdi-arrow-split-horizontal</v-icon>-->
          <!--                    <div style="width: 10px"></div>-->
          <!--                    <v-icon size="40" @click="deleteSlide(slide)">mdi-delete</v-icon>-->

          <!--                  </template>-->
          <!--                  <v-list-item-title class="font-weight-bold mb-2">-->
          <!--                    {{ slide.inBlockIndex }} - {{ slide.imageName }}-->
          <!--                  </v-list-item-title>-->
          <!--                  <v-list-item-subtitle>-->
          <!--                    <v-icon @click="editLabel(slide)" :style="'color:'+ (slide.label ? 'white' : 'gray')">mdi-tag</v-icon>-->
          <!--                    <v-menu :id="'trigger-'+slide.imageName" location="bottom" @click.stop="">-->
          <!--                      <template v-slot:activator="{ props }">-->
          <!--                        <v-icon v-bind="props" v-if="!slide.trigger || slide.trigger.type === 'timed'">mdi-timer</v-icon>-->
          <!--                        <v-icon v-bind="props" v-else-if="slide.trigger.type === 'key' && slide.trigger.onlyOnce !== true">mdi-keyboard</v-icon>-->
          <!--                        <v-icon v-bind="props" v-else>mdi-keyboard-outline</v-icon>-->
          <!--                      </template>-->
          <!--                      <v-list>-->
          <!--                        <v-list-item prepend-icon="mdi-timer" @click="setTransition(slide, 'continue')">-->
          <!--                          <v-list-item-title>{{ $t('editor.transition.continue') }}</v-list-item-title>-->
          <!--                        </v-list-item>-->
          <!--                        <v-list-item prepend-icon="mdi-keyboard" @click="setTransition(slide, 'hold')">-->
          <!--                          <v-list-item-title>{{ $t('editor.transition.hold') }}</v-list-item-title>-->
          <!--                        </v-list-item>-->
          <!--                        <v-list-item prepend-icon="mdi-keyboard-outline" @click="setTransition(slide, 'holdOnce')">-->
          <!--                          <v-list-item-title>{{ $t('editor.transition.holdOnce') }}</v-list-item-title>-->
          <!--                        </v-list-item>-->
          <!--                      </v-list>-->
          <!--                    </v-menu>-->
          <!--                  </v-list-item-subtitle>-->
          <!--                </v-list-item>-->
          <!--              </template>-->
          <!--              <div class="drag-marker" :class="{ 'drag-marker-visible' : isDragTargetSelected( block, undefined) }"-->
          <!--                   @dragenter="handleSlideDragEnter($event, block, undefined, true)"-->
          <!--                   @dragleave="handleSlideDragLeave($event, true)"-->
          <!--                   @drop="drop($event, dragTarget)"-->
          <!--                   @dragover.prevent>-->
          <!--              </div>-->

          <!--            </v-list-group>-->
        </v-list>
        <div class="ma-2" style="display: none;">
          <!--          DT: {{ dragType }} - BC: {{ blockDragCounter }} - SC: {{ slideDragCounter }} - TT: {{ dragTarget?.type }} - TBI:-->
          <!--          {{ dragTarget?.block.index }} - -->
        </div>
      </v-sheet>

      <v-toolbar density="compact" class="basket-toolbar px-2" ref="basketToolbar"
                 :style="'top:'+headerSize.height.value+'px' ">
        <v-icon size="32" @click="selectAllInBasket" class="mr-2">mdi-checkbox-multiple-marked-outline</v-icon>
        <v-icon size="32" @click="selectNoneInBasket" class="mr-2">mdi-checkbox-multiple-blank-outline</v-icon>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-sheet ref="basket" class="basket" variant="elevated" :style="boxHeight">

        <v-list v-if="basketList" class="basket-list">
          <v-list-item v-for="image in unusedItemsInBasket" :key="image.imageName"
                       class="my-1 slide-box" :class="{ 'selected': basketSelectedItems.includes(image) }"
                       @click="basketSelectItem($event, image)"
                       :draggable="true"
                       @dragstart="basketDragStart($event, image)"
                       @dragend="dragEnd">
            <!--                        <v-list-item v-for="image in unusedItemsInBasket" :key="image.imageName"-->
            <!--                         class="my-1 slide-box" :class="{ 'selected': basketSelectedItems.includes(image) }"-->
            <!--                         @click="basketSelectItem($event, image)"-->
            <!--                         :draggable="true"-->
            <!--                         @dragstart="basketDragStart($event, image)"-->
            <!--                         @dragend="dragEnd">-->
            <template #prepend>
              <v-img class="mr-2 thumbnail" style="width: 120px; height: 80px; background-color: #0d0d0d;"
                     :src="image.thumbnail" aspect-ratio="1"></v-img>
            </template>
            <v-list-item-title class="font-weight-bold mb-2">
              {{ image.imageName }}
            </v-list-item-title>
            <v-list-item-subtitle>
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-sheet>
    </v-container>
  </application-layout>
  <div id="dragHolder" class="dragBox">
    <div class="drag-label">
      {{ $t('editor.drag', {count: basketSelectedItems.length}) }}
    </div>
    <v-img v-if="basketSelectedItems.length > 5" class="drag-thumbnail thumbnail" style="left:13px; top:13px; "></v-img>
    <v-img v-if="basketSelectedItems.length > 1" class="drag-thumbnail thumbnail" style="left:9px; top:9px; "></v-img>
    <img :src="dragHolderThumbnail" alt="" class="drag-thumbnail thumbnail" style="left:5px; top:5px;">
  </div>
  <!--  <label-editor-dialog ref="labelEditor"></label-editor-dialog>-->
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
  VRow,
  VSheet,
  VSpacer,
  VTextField,
  VToolbar
} from 'vuetify/components'
import { computed, onMounted, Ref, ref, toRaw } from 'vue'
import ApplicationLayout from '@/layouts/ApplicationLayout.vue'
import { BasketItem, GroupSlide, ImageSlide, Slide, SlideShow } from '@/entities/SlideShowTypes'
import useEditorApi from '@/api/editorApi'
import { useElementSize, useWindowSize } from '@vueuse/core'
import { useEditorStore } from '@/stores/editorStore'
import useResourceApi from '@/api/resourceApi'
import { getAllImageSlides, nextUID } from '@/entities/SlideShowUtils'
import { useConfirmDialog } from '@/modules/dialog/confirmDialog'

const editorApi = useEditorApi()
const resourceApi = useResourceApi()
const editorStore = useEditorStore()
const createConfirmDialog = useConfirmDialog()!

const slideShow: Ref<SlideShow> = ref({ slides: [], totalSlides: 0 })
const header = ref()
const reelToolbar = ref()

const headerSize = useElementSize(header)
const reelToolbarSize = useElementSize(reelToolbar)
const windowSize = useWindowSize()

const boxHeight = computed(() => {
  return 'height:' + (windowSize.height.value - headerSize.height.value - reelToolbarSize.height.value) + 'px'
})

const openedGroups = ref<number[]>([])

onMounted(async () => {
  console.log('editorStore', editorStore.slideShow)
  if (editorStore.slideShow == null) {
    await editorStore.setCurrentSlideShow('gallery/iceland', 'marci')
  }
  slideShow.value = editorStore.slideShow!
  console.log('slideShow', slideShow.value)
  if (slideShow.value) {
    openedGroups.value.slice(0, openedGroups.value.length)
    slideShow.value.slides.forEach((slide: Slide) => {
      if (slide.type === 'group') {
        openedGroups.value.push(slide.uid)
        slide.slides.forEach((slide: ImageSlide) => {
          if (slide.thumbnail === undefined) {
            resourceApi.requestThumbnail(slide.imageName).then((response) => {
              slide.thumbnail = URL.createObjectURL(response)
            })
          }
        })
      } else {
        resourceApi.requestThumbnail(slide.imageName).then((response) => {
          slide.thumbnail = URL.createObjectURL(response)
        })
      }
    })
  }
  scan()
})

function scan() {
  console.log('scan', editorStore.path)
  editorApi.scanDirectory(editorStore.path).then((response) => {
    console.log('scan response', response)
    if (response.successful) {
      const slideImageNames = new Map<string, ImageSlide>()
      getAllImageSlides(slideShow.value).forEach((slide) => slideImageNames.set(slide.imageName, slide))
      basketList.value = []
      response.images?.forEach((file) => {
        const usedInSlideShow = slideImageNames.has(file.fileName)
        basketList.value.push({
          imageName: file.fileName,
          thumbnail: undefined,
          usedInSlideShow
        })
        if (usedInSlideShow) {
          slideImageNames.delete(file.fileName)
        }
        resourceApi.requestThumbnail(file.fileName).then((response) => {
          const b = basketList.value.find((i) => i.imageName === file.fileName)
          if (b) {
            b.thumbnail = URL.createObjectURL(response)
          }
        })
      })
      console.log('MISSING', slideImageNames.keys())
      for (const slide of slideImageNames.values()) {
        slide.missing = true
      }
    }
  })
}

//
// function setAtTheEnd(block: SlideShowBlock, type: 'continue' | 'hold' | 'loop') {
//   block.atTheEnd = { type }
// }
//
// function indexOfBlock(block: SlideShowBlock) {
//   return slideShow.value.slides.indexOf(block)
// }
//
// function mergeUp(block: SlideShowBlock) {
//   const ss = slideShow.value
//   const i = indexOfBlock(block)
//   const prevBlock = ss.slides[i - 1]
//   block.slides.forEach((s) => {
//     prevBlock.slides.push(s)
//     s.block = prevBlock
//     s.blockIndex = prevBlock.index
//     s.inBlockIndex = prevBlock.slides.length
//   })
//   ss.slides.splice(i, 1)
//   for (let p = i; p < ss.slides.length; p++) {
//     ss.slides[p].index = p + 1
//   }
//   const obidx = openedGroups.value.indexOf(block.uid)
//   if (obidx !== -1) {
//     openedGroups.value.splice(obidx, 1)
//   }
// }
//
// const reelBlocks = ref()
//
// function splitBlock(block: SlideShowBlock, slide: Slide) {
//   const ss = slideShow.value
//   const i = indexOfBlock(block)
//   const newBlock: SlideShowBlock = { slides: [], index: i + 1, uid: nextUID() }
//   ss.slides.splice(i + 1, 0, newBlock)
//   let ibi = 1
//   const startIndex = slide.inBlockIndex! - 1
//   for (let p = startIndex; p < block.slides.length; p++) {
//     const s = block.slides[p]
//     s.inBlockIndex = ibi++
//     s.block = newBlock
//     s.blockIndex = newBlock.index
//     newBlock.slides.push(s)
//   }
//   block.slides.splice(startIndex, block.slides.length)
//   for (let p = i; p < ss.slides.length; p++) {
//     ss.slides[p].index = p + 1
//   }
//
//   nextTick(() => {
//     openedGroups.value.push(newBlock.uid)
//   })
// }
//
// watchEffect(() => {
//   console.log('OB', [...openedGroups.value])
// })
//
const basketList = ref<BasketItem[]>([])
const unusedItemsInBasket = computed(() => basketList.value.filter((item) => item.usedInSlideShow === false))
//
// function deleteSlide(slide: Slide) {
//   reelRemoveItems([slide])
// }
//
// function addBlock() {
//   const ss = slideShow.value
//   const newBlock: SlideShowBlock = { slides: [], index: ss.slides.length + 1, uid: nextUID() }
//   ss.slides.push(newBlock)
//   openedGroups.value.push(newBlock.uid)
// }
//
// function setTransition(slide: Slide, type: 'continue' | 'hold' | 'holdOnce') {
//   if (type === 'continue') {
//     delete slide.trigger
//   } else if (type === 'hold') {
//     slide.trigger = { type: 'key' }
//   } else if (type === 'holdOnce') {
//     slide.trigger = { type: 'key', onlyOnce: true }
//   }
// }

// =====================================================================================================================
// Drag and drop base
// =====================================================================================================================

type DragTargetInfo = {
  nextSlide: Slide | undefined
  group: GroupSlide | undefined
  type: 'slide' | 'marker'
}

enum DragType {
  BASKET_TO_REEL = 'basket-to-reel',
  REEL_REORDER = 'reel-reorder'
}

const dragType = ref<DragType | undefined>()
const dragHolderThumbnail = ref<string | undefined>()

const dragTarget = ref<undefined | DragTargetInfo>()

const blockDragCounter = ref(0)
const slideDragCounter = ref(0)

function clearDragTarget() {
  console.log('Clear drag target')
  dragTarget.value = undefined
}

//
// function handleBlockDragEnter(event: DragEvent) {
//   // if (event.target === event.currentTarget || (event.currentTarget as Node).contains(event.target as Node)) {
//   blockDragCounter.value++
//   // }
//   event.preventDefault()
//   console.log('Drag enter on block', block.index, blockDragCounter.value)
//   const newTarget: DragTargetInfo = {
//     block,
//     nextSlide: (openedGroups.value.includes(block.uid)) ? (block.slides.length === 0 ? undefined : block.slides[0]) : undefined,
//     type: 'block'
//   }
//   if (newTarget.block === dragTarget.value?.block && newTarget.nextSlide === dragTarget.value?.nextSlide) {
//     return
//   }
//   console.log('Drag target', newTarget.block.index, newTarget.nextSlide?.inBlockIndex)
//   dragTarget.value = newTarget
// }
//
// function handleBlockDragLeave(event: DragEvent, block: SlideShowBlock) {
//   // if (event.target === event.currentTarget || (event.currentTarget as Node).contains(event.target as Node)) {
//   blockDragCounter.value--
//   if (blockDragCounter.value <= 0) {
//     if (dragTarget.value?.type === 'block') {
//       console.log('Drag leave on block', block.index, blockDragCounter.value, dragTarget.value?.type)
//       clearDragTarget()
//       blockDragCounter.value = 0
//     }
//   }
//   // }
//   event.preventDefault()
// }

function handleSlideDragEnter(event: DragEvent, slide: Slide | undefined, isMarker: boolean = false) {
  // if (event.target === event.currentTarget || (event.currentTarget as Node).contains(event.target as Node)) {
  slideDragCounter.value++
  event.stopPropagation()
  event.preventDefault()
  const isUp = event.offsetY < 40
  const inGroup = slide?.type === 'image' && slide?.group !== undefined
  let group = inGroup ? slide!.group! : undefined
  console.log(`Drag enter on slide marker=${isMarker} offset=${event.offsetY} isUp=${isUp} inGroup=${inGroup} counter=${slideDragCounter.value}`, slide)
  let newTarget: DragTargetInfo
  if (isUp) {
    newTarget = {
      nextSlide: slide,
      group,
      type: isMarker ? 'marker' : 'slide'
    }
  } else {
    let nextSlide: Slide | undefined
    if (inGroup) {
      const nextIndex = (slide === undefined || slide.index! === slide.group!.slides.length) ? undefined : slide.index!
      nextSlide = nextIndex === undefined ? undefined : slide.group!.slides[nextIndex]
    } else {
      if (slide?.type === 'group') {
        nextSlide = slide.slides[0]
        group = slide
      } else {
        const nextIndex = (slide === undefined || slide.index! === slideShow.value.slides.length) ? undefined : slide.index!
        nextSlide = nextIndex === undefined ? undefined : slideShow.value.slides[nextIndex]
      }
    }
    if (dragType.value === DragType.REEL_REORDER && !reelIsValidDragTarget(group, nextSlide)) {
      clearDragTarget()
      return
    }
    newTarget = {
      nextSlide,
      group,
      type: isMarker ? 'marker' : 'slide'
    }
  }
  if (newTarget.type === dragTarget.value?.type && newTarget.group === dragTarget.value?.group && newTarget.nextSlide === dragTarget.value?.nextSlide) {
    return
  }
  console.log('Drag target', newTarget.nextSlide?.index, inGroup)
  dragTarget.value = newTarget
}

function handleSlideDragLeave(event: DragEvent, isMarker: boolean = false) {
  slideDragCounter.value--
  if (slideDragCounter.value <= 0) {
    if (dragTarget.value?.type === (isMarker ? 'marker' : 'slide')) {
      console.log('Drag leave slide', isMarker)
      clearDragTarget()
      slideDragCounter.value = 0
    }
    // }
  }
  event.stopPropagation()
  event.preventDefault()
}

function initializeDragHolder(event: DragEvent) {
  const dragPreview = document.getElementById('dragHolder')!
  dragPreview.style.display = 'flex'

  event.dataTransfer!.setDragImage(dragPreview, 60, 40)
}

function drop(event: DragEvent, target: DragTargetInfo | undefined) {
  event.preventDefault()
  event.stopPropagation()
  console.log('Dropped: ', toRaw(target))
  if (target) {
    if (dragType.value === DragType.BASKET_TO_REEL) {
      dropBasketToReel(target)
    } else if (dragType.value === DragType.REEL_REORDER) {
      dropReelReorder(target)
    }
  }
}

function dragEnd(event: DragEvent) {
  event.preventDefault()
  const dragPreview = document.getElementById('dragHolder')!
  dragPreview.style.display = 'none'
  // TODO Remove items to basket
  // if (dragType.value === DragType.REEL_REORDER && !dragTarget.value) {
  //   reelRemoveItems(reelSelectedItems.value)
  // }
  clearDragTarget()
  blockDragCounter.value = 0
  slideDragCounter.value = 0
  dragType.value = undefined
}

function isDragTargetSelected(slide: Slide | undefined, group: GroupSlide | undefined) {
  if (!dragTarget.value) return false
  return slide === dragTarget.value.nextSlide && group === dragTarget.value.group
}

// =====================================================================================================================
// BASKET -> REEL - Drag and drop
// =====================================================================================================================

const basketSelectedItems = ref<BasketItem[]>([])
let basketLastSelectedItemIndex: number = -1

function selectAllInBasket() {
  basketSelectedItems.value = [...unusedItemsInBasket.value]
}

function selectNoneInBasket() {
  basketSelectedItems.value = []
}

function basketSelectItem(event: MouseEvent | KeyboardEvent, basketItem: BasketItem) {
  const itemIndex = unusedItemsInBasket.value.findIndex(item => item === basketItem)

  const index = basketSelectedItems.value.indexOf(basketItem)
  if (event.shiftKey && basketLastSelectedItemIndex !== -1) {
    // Shift+Click: Select range
    const start = Math.min(basketLastSelectedItemIndex, itemIndex)
    const end = Math.max(basketLastSelectedItemIndex, itemIndex)
    if (!event.ctrlKey) {
      basketSelectedItems.value = []
    }
    for (let i = start; i <= end; i++) {
      basketSelectedItems.value.push(unusedItemsInBasket.value[i])
    }
  } else if (event.ctrlKey) {
    // Ctrl+Click: Toggle selection
    if (index !== -1) {
      basketSelectedItems.value.splice(index, 1)
    } else {
      basketSelectedItems.value.push(basketItem)
    }
  } else {
    // Single click: Select single item
    basketSelectedItems.value = [basketItem]
  }

  basketLastSelectedItemIndex = itemIndex
}

function basketDragStart(event: DragEvent, image: BasketItem) {
  if (!basketSelectedItems.value.includes(image)) {
    if (event.ctrlKey) basketSelectItem(event, image)
    else basketSelectedItems.value = [image]
  }
  console.log('Drag start', basketSelectedItems.value.map((s) => s.thumbnail))
  dragHolderThumbnail.value = basketSelectedItems.value[0]?.thumbnail
  initializeDragHolder(event)
  dragType.value = DragType.BASKET_TO_REEL
}

function dropBasketToReel(target: DragTargetInfo) {
  reelSelectedItems.value.splice(0, reelSelectedItems.value.length)
  const group = target.group
  const targetContainer = group ?? slideShow.value
  const itemsToAdd: Slide[] = []
  let index = target.nextSlide ? target.nextSlide.index! : targetContainer.slides.length + 1
  const insertIndex = index - 1
  console.warn('Drop basket to reel', targetContainer, insertIndex)
  basketSelectedItems.value.forEach((item) => {
    const slide: ImageSlide = {
      uid: nextUID(),
      type: 'image',
      imageName: item.imageName,
      thumbnail: item.thumbnail,
      index: index++
    }
    if (group) {
      slide.group = group
    }
    itemsToAdd.push(slide)
    item.usedInSlideShow = true
    reelSelectedItems.value.push(slide)
  })
  targetContainer.slides.splice(insertIndex, 0, ...itemsToAdd)
  for (let i = index - 1; i < targetContainer.slides.length; i++) {
    targetContainer.slides[i].index = i + 1
  }
  console.log('Updated', slideShow.value)
  basketSelectedItems.value.splice(0, basketSelectedItems.value.length)
}

// =====================================================================================================================
// REEL REORDER - Drag and drop
// =====================================================================================================================

const reelSelectedItems = ref<Slide[]>([])
let reelLastSelectedItem: Slide | undefined

// let reelLastSelectedItemIndex: number = -1

function fullIndex(slide: Slide) {
  return ((slide.type === 'image' && slide.group) ? slide.group.index + '.' : '') + slide.index
}

function reelSelectItem(event: MouseEvent | KeyboardEvent, slide: Slide) {
  const itemIndex = slide.index!
  console.log('Select item', itemIndex, slide)

  const index = reelSelectedItems.value.indexOf(slide)
  const reelLastSelectedItemIndex = reelLastSelectedItem?.index
  if (event.shiftKey && reelLastSelectedItemIndex !== undefined) {
    // Shift+Click: Select range
    const group = slide.type === 'image' && slide.group !== undefined ? slide.group : undefined
    const lastGroup = reelLastSelectedItem?.type === 'image' ? reelLastSelectedItem.group : undefined
    if (group === lastGroup) {
      const targetGroup = group ?? slideShow.value
      const start = Math.min(reelLastSelectedItemIndex, itemIndex)
      const end = Math.max(reelLastSelectedItemIndex, itemIndex)
      if (!event.ctrlKey) {
        reelSelectedItems.value = []
      }
      for (let i = start; i <= end; i++) {
        reelSelectedItems.value.push(targetGroup.slides[i - 1]!)
      }
    } else {
      return
    }
  } else if (event.ctrlKey) {
    // Ctrl+Click: Toggle selection
    if (index !== -1) {
      reelSelectedItems.value.splice(index, 1)
    } else {
      reelSelectedItems.value.push(slide)
    }
  } else {
    // Single click: Select single item
    reelSelectedItems.value = [slide]
  }

  reelLastSelectedItem = slide

  console.log('Selected items', reelSelectedItems.value.map((s) => fullIndex(s)))
}

function reelDragStart(event: DragEvent, slide: Slide) {
  console.log('Drag start', slide.index)
  if (!reelSelectedItems.value.includes(slide)) {
    if (event.ctrlKey) reelSelectItem(event, slide)
    else reelSelectedItems.value = [slide]
  }

  let firstImage: ImageSlide | undefined
  for (let i = 0; i < reelSelectedItems.value.length; i++) {
    if (reelSelectedItems.value[i].type === 'image') {
      firstImage = reelSelectedItems.value[i] as ImageSlide
      break
    }
  }
  if (!firstImage) {
    for (let i = 0; i < reelSelectedItems.value.length; i++) {
      if (reelSelectedItems.value[i].type === 'group') {
        const g = (reelSelectedItems.value[i] as GroupSlide)
        if (g.slides.length > 0) {
          firstImage = g.slides[0]
          break
        }
      }
    }
  }

  dragHolderThumbnail.value = firstImage?.thumbnail
  initializeDragHolder(event)
  dragType.value = DragType.REEL_REORDER
}

// TODO Prevent drag if group is selected
function reelIsValidDragTarget(group: GroupSlide | undefined, target: Slide | undefined) {
  console.warn('Valid drag target', group, target)
  if (group !== undefined) {
    return !reelSelectedItems.value.some((s) => s.type === 'group')
  }
  return true
}

function dropReelReorder(target: DragTargetInfo) {
  console.log('Reel reorder', reelSelectedItems.value.map((s) => fullIndex(s)))
  const selected = reelSelectedItems.value.filter((s) => {
    if (s.type === 'group') {
      return true
    }
    return s.group === undefined || !reelSelectedItems.value.includes(s.group)
  }).sort((s1, s2) => fullIndex(s1) < fullIndex(s2) ? -1 : 1)
  console.log('Selected', selected.map((s) => fullIndex(s)))

  const changedGroups = new Set<GroupSlide>()
  let rootChanged = false
  const targetGroup = target.group

  selected.forEach((slide: Slide) => {
    if (slide.type === 'image' && slide.group) {
      const index = slide.group.slides.indexOf(slide)
      slide.group.slides.splice(index, 1)
      changedGroups.add(slide.group)
    } else {
      const index = slideShow.value.slides.indexOf(slide)
      slideShow.value.slides.splice(index, 1)
      rootChanged = true
    }
    if (slide.type === 'image') {
      if (targetGroup !== undefined) {
        slide.group = targetGroup
      } else {
        delete slide.group
      }
    }
  })

  if (targetGroup) {
    changedGroups.add(targetGroup)
  } else {
    rootChanged = true
  }

  const targetContainer = targetGroup ?? slideShow.value
  let insertIndex: number
  if (target.nextSlide !== undefined) {
    insertIndex = targetContainer.slides.findIndex((slide : Slide) => slide.index >= (target.nextSlide!.index))
    if (insertIndex === -1) {
      insertIndex = targetContainer.slides.length
    }
  } else {
    insertIndex = targetContainer.slides.length
  }

  console.log('Insert at', insertIndex, targetContainer)

  targetContainer.slides.splice(insertIndex, 0, ...selected)
  if (rootChanged) {
    for (let i = 0; i < slideShow.value.slides.length; i++) {
      slideShow.value.slides[i].index = i + 1
    }
  }
  changedGroups.forEach((group) => {
    for (let i = 0; i < group.slides.length; i++) {
      group.slides[i].index = i + 1
    }
  })

  console.log('Updated', slideShow.value)
}

//
// function reelRemoveItems(items: Slide[]) {
//   createConfirmDialog({
//     title: '@editor.deleteSlide.title',
//     titleColor: 'red',
//     content: '@editor.deleteSlide.message',
//     buttons: ButtonSet.yesNo
//   }).then((button) => {
//     if (button === Button.YES) {
//       console.log('Reel remove items', items)
//       items.forEach((slide) => {
//         const block = slide.block
//         const index = block.slides.indexOf(slide)
//         if (index !== -1) {
//           block.slides.splice(index, 1)
//         }
//       })
//       basketSelectedItems.value.splice(0, basketSelectedItems.value.length)
//       basketList.value
//         .filter((basketItem) => reelSelectedItems.value.some((item) => item.imageName === basketItem.imageName))
//         .forEach((item) => {
//           item.usedInSlideShow = false
//           basketSelectedItems.value.push(item)
//         })
//       updateSlideInfo()
//     }
//     reelSelectedItems.value.splice(0, reelSelectedItems.value.length)
//   })
// }
//
// function updateSlideInfo() {
//   let absoluteIndex = 1
//   slideShow.value.slides.forEach((block) => {
//     block.slides.forEach((slide, index) => {
//       slide.block = block
//       slide.inBlockIndex = index + 1
//       slide.blockIndex = block.index
//       slide.absoluteIndex = absoluteIndex++
//     })
//   })
// }
//
// function save() {
//   const data = toData(slideShow.value)
//   useSlideShowApi().saveSlideShow(editorStore.path, editorStore.name, data).then((response) => {
//     console.log('Save response', response)
//   })
// }

// const labelEditor = ref<typeof LabelEditorDialog>()
//
// function editLabel(slide: Slide) {
//   console.log('Edit label', slide, labelEditor.value)
//   labelEditor.value?.open(slide)
// }

</script>

<style scoped>

.header {
  background-color: #1e1f38;
  color: whitesmoke;
}

.reel {
  position: absolute;
  background-color: #333333;
  width: 50%;
  color: whitesmoke;
  overflow-y: auto !important;
}

.reel-toolbar {
  background-color: #333333;
  width: 50%;
  color: whitesmoke;
}

.basket-toolbar {
  position: absolute;
  background-color: #333333;
  border-left: 1px solid whitesmoke;
  width: 50%;
  color: whitesmoke;
  left: 50%;
}

.basket {
  position: absolute;
  background-color: #333333;
  border-left: 1px solid whitesmoke;
  width: 50%;
  left: 50%;
  color: whitesmoke;
  overflow-y: auto;
}

.reel-list, .basket-list {
  text-align: left;
  margin: 2px 5px;
  background-color: #0d0d0d !important;
  user-select: none;
}

.slide-box {
  box-sizing: border-box;
  border-top: 3px solid #00000000;
  border-bottom: 3px solid #00000000;
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
  margin: 0 10px;
}

.thumbnail {
  border: 1px solid #aaaaaa;
  width: 120px;
  height: 80px;
  background-color: #0d0d0d;
}

.block-index {
  font-size: 120%;
  font-weight: bold;
}

.selected {
  background: repeating-linear-gradient(
    45deg,
    #545454,
    #545454 5px,
    #49497a 5px,
    #49497a 10px
  );
}

.dragBox {
  display: none;
  position: absolute;
}

.drag-thumbnail {
  position: absolute;
  min-width: 120px;
  min-height: 80px;
  object-fit: scale-down;
}

.drag-label {
  margin: 55px 5px;
  width: 120px;
  height: 80px;
  text-shadow: -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000;
  color: yellow;
  z-index: 1000;
  text-align: center;
  vertical-align: bottom;
}

.drag-marker {
  height: 3px;
  margin: 0 0.5em;
  background-color: #0d0d0d;
  padding: 0;
}

.drag-marker-visible {
  background-color: #139ff7 !important;
}

.drag-marker-in-group-visible {
  background-color: #f7b613 !important;
}

.missing {
  position: absolute;
  left: 100px;
}

.group-container {
  border-left: 2px solid #362c2c;
  box-sizing: border-box;
}

.group-head {
  background-color: #362c2c;
  margin-left: 0.5em;
  margin-right: calc(0.5em + 2px);
}

.selected-group-head {
  background: repeating-linear-gradient(
    45deg,
    #362c2c,
    #362c2c 5px,
    #414173 5px,
    #414173 10px
  );
}

.group-slide {
  border-left: 2px solid #362c2c;
  box-sizing: border-box;
  padding-left: 1.5em !important;
  background-color: #443d3d;
  margin-left: calc(0.5em);
}

.selected-group-slide {
  background: repeating-linear-gradient(
    45deg,
    #443d3d,
    #443d3d 5px,
    #414173 5px,
    #414173 10px
  );
}
</style>
