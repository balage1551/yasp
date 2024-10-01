<template>
  <application-layout>

    <v-container fluid class="pa-0 ma-0 ">
      <v-sheet ref="header" class="header px-2 " variant="elevated">
        <v-container fluid class="ma-0">
          <v-row>
            <v-col cols="4">
              <v-text-field variant="outlined" v-model="editorStore.path" :label="$t('editor.directory')"
                            prepend-inner-icon="mdi-folder" hide-details readonly>
                <template #append-inner>
                  <v-btn color="primary" @click="scan">
                    <v-icon>mdi-refresh</v-icon>
                  </v-btn>
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
                        <v-col cols="1" class="text-right" >
                          <v-btn class="mt-2" color="primary" @click="save">{{ $t('common.save' )}}</v-btn>
                        </v-col>
          </v-row>
        </v-container>
      </v-sheet>
      <v-toolbar v-if="slideShowLoaded" density="compact" class="reel-toolbar px-2 py-1" ref="reelToolbar">
        <v-col cols="2" class="mt-2">
          {{ $t('editor.trigger') }}
          <trigger-settings-popup v-model="slideShow.trigger" :inherited="DEFAULT_TRIGGER"></trigger-settings-popup>
        </v-col>
        <v-col cols="2" class="mt-2">
          {{ $t('editor.groupTrigger') }}
          <trigger-settings-popup v-model="slideShow.groupTrigger"
                                  :inherited="DEFAULT_GROUP_TRIGGER"></trigger-settings-popup>
        </v-col>
        <v-col cols="3" class="mt-2">
          {{ $t('editor.groupSlideTrigger') }}
          <trigger-settings-popup v-model="slideShow.groupSlideTrigger"
                                  :inherited="DEFAULT_GROUP_SLIDE_TRIGGER"></trigger-settings-popup>
        </v-col>
        <v-spacer></v-spacer>
        <v-icon size="40"
                :disabled="reelSelectedImageSlides.length === 0"
                class="mr-8"
                @click="editLabelMultiple()">
        >
          mdi-tag-multiple
        </v-icon>
        <v-icon size="40"
                class="cursor-grab"
                :draggable="true"
                @dragstart="newGroupDragStart($event)"
                @dragend="dragEnd($event)">
          mdi-folder-plus
        </v-icon>
      </v-toolbar>
      <v-sheet ref="reel" class="reel" variant="elevated" :style="boxHeight">

        <v-list v-if="slideShow " class="reel-list" v-model:opened="openedGroups" ref="dropZone">
          <template v-for="slide in slideShow.slides" :key="slide.uid">

            <!-- Pre main slide marker -->
            <div class="drag-marker"
                 :id="'undefined.'+slide.uid"
                 @dragenter="handleSlideDragEnter($event, slide, true)"
                 @dragleave="handleSlideDragLeave($event, true)"
                 @drop="drop($event, dragTarget)"
                 @dragover.prevent>
            </div>

            <!-- Main slide -->
            <image-slide-box v-if="slide.type === 'image'"
                             :slide="slide"
                             :slide-show="slideShow"
                             :selected=" reelSelectedItems.includes(slide)"

                             @delete="deleteSlide(slide)"
                             @editLabel="editLabel(slide)"
                             @preview="preview(slide)"

                             @dragover.prevent
                             :draggable="true"
                             @click="reelSelectItem($event, slide)"
                             @dragenter="handleSlideDragEnter($event, slide)"
                             @dragleave="handleSlideDragLeave($event)"
                             @drop="drop($event, dragTarget)"

                             @dragstart="reelDragStart($event, slide)"
                             @dragend="dragEnd"
            >
            </image-slide-box>

            <!-- Group slide -->
            <v-list-group v-else class="group-container" :value="slide.uid">
              <template v-slot:activator="{props}">
                <v-list-item v-bind="props"
                             :ref="el => slideRefs.set(slide.uid, el as VListItem)"
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
                            <div class="slide-index">
                              {{ slide.index }}
                            </div>
                          </template>
                        </v-text-field>
                      </v-col>
                      <v-col cols="2" class="mt-2">
                        {{ $t('editor.groupTrigger') }}
                        <trigger-settings-popup v-model="(slide as GroupSlide).trigger"
                                                :inherited="slideShow.groupTrigger ?? DEFAULT_GROUP_TRIGGER"></trigger-settings-popup>
                      </v-col>
                      <v-col cols="3" class="mt-2">
                        {{ $t('editor.groupSlideTrigger') }}
                        <trigger-settings-popup v-model="(slide as GroupSlide).slideTrigger"
                                                :inherited="slideShow.groupSlideTrigger ?? DEFAULT_GROUP_SLIDE_TRIGGER"></trigger-settings-popup>
                      </v-col>
                    </v-row>
                  </v-container>

                  <template #append>
                    <v-icon size="40" @click.stop="deleteSlide(slide)">mdi-delete</v-icon>
                    <v-icon size="40" @click.stop="toggleOpen(slide as GroupSlide)">mdi-chevron-down</v-icon>

                  </template>
                </v-list-item>
              </template>

              <template v-for="inGroupSlide in (slide as GroupSlide).slides" :key="inGroupSlide.uid">

                <!-- Group slide item pre marker -->
                <div class="drag-marker"
                     :id="slide.uid+'.'+inGroupSlide.uid"
                     @dragenter="handleSlideDragEnter($event, inGroupSlide, true)"
                     @dragleave="handleSlideDragLeave($event, true)"
                     @drop="drop($event, dragTarget)"
                     @dragover.prevent>
                </div>

                <!-- Group slide item -->
                <image-slide-box :slide="inGroupSlide"
                                 :isGroupSlide="true"
                                 :slide-show="slideShow"
                                 :selected=" reelSelectedItems.includes(inGroupSlide)"

                                 @delete="deleteSlide(inGroupSlide)"
                                 @editLabel="editLabel(inGroupSlide)"
                                 @preview="preview(inGroupSlide)"

                                 @dragover.prevent
                                 :draggable="true"
                                 @click="reelSelectItem($event, inGroupSlide)"
                                 @dragenter="handleSlideDragEnter($event, inGroupSlide)"
                                 @dragleave="handleSlideDragLeave($event)"
                                 @drop="drop($event, dragTarget)"

                                 @dragstart="reelDragStart($event, inGroupSlide)"
                                 @dragend="dragEnd"
                >
                </image-slide-box>

              </template>

              <!-- Group slide item post marker -->
              <div class="drag-marker"
                   :id="slide.uid+'.undefined'"
                   @dragenter="handleSlideDragEnter($event, undefined, true)"
                   @dragleave="handleSlideDragLeave($event, true)"
                   @drop="drop($event, dragTarget)"
                   @dragover.prevent>
              </div>

            </v-list-group>
          </template>

          <!-- Post main slide marker -->
          <div class="drag-marker"
               id="undefined.undefined"
               @dragenter="handleSlideDragEnter($event, undefined, true)"
               @dragleave="handleSlideDragLeave($event, true)"
               @drop="drop($event, dragTarget)"
               @dragover.prevent>
          </div>

        </v-list>
      </v-sheet>
      <div v-if="slideShow" class="statusbar reel-statusbar" ref="reelStatusBar">
        <v-icon>mdi-filmstrip-box</v-icon> {{ slideShow.slides.length }}
        <v-icon class="ml-2">mdi-image</v-icon>  {{ totalSlides }}
        <v-icon class="ml-2">mdi-basket</v-icon> {{ reelSelectedItems.length }}
      </div>

      <v-toolbar density="compact" class="basket-toolbar px-2 py-1" ref="basketToolbar"
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
      <div v-if="slideShow" class="statusbar basket-statusbar" ref="basketStatusBar">
        <v-icon class="ml-2">mdi-image</v-icon>  {{ unusedItemsInBasket.length }}
        <v-icon class="ml-2">mdi-basket</v-icon> {{ basketSelectedItems.length }}
      </div>

    </v-container>
  </application-layout>
  <div style="position: absolute; left: -1000px; top:-1000px;">
    <div id="dragHolder" class="dragBox">
      <div class="drag-label">
        {{ $t('editor.drag', {count: dragSelectedItems.length}) }}
      </div>
      <v-img v-if="dragSelectedItems.length > 5" class="drag-thumbnail thumbnail" style="left:13px; top:13px; "></v-img>
      <v-img v-if="dragSelectedItems.length > 1" class="drag-thumbnail thumbnail" style="left:9px; top:9px; "></v-img>
      <img ref="dragHolderTopImage" :src="dragHolderThumbnail" alt="" class="drag-thumbnail thumbnail"
           style="left:5px; top:5px;">
    </div>
  </div>
  <preview-dialog v-model="previewVisible" :slide="previewSlide!" @close="previewVisible = false"></preview-dialog>
  <label-editor-dialog v-if="showLabelEditor" @close="hideLabelEditor" ref="labelEditor"></label-editor-dialog>
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
import { computed, nextTick, onMounted, Ref, ref } from 'vue'
import ApplicationLayout from '@/layouts/ApplicationLayout.vue'
import {
  BasketItem,
  DEFAULT_GROUP_SLIDE_TRIGGER,
  DEFAULT_GROUP_TRIGGER,
  DEFAULT_TRIGGER,
  GroupSlide,
  ImageSlide,
  Slide,
  SlideShow
} from '@/entities/SlideShowTypes'
import useEditorApi from '@/api/editorApi'
import { useElementSize, useWindowSize } from '@vueuse/core'
import { useEditorStore } from '@/stores/editorStore'
import useResourceApi from '@/api/resourceApi'
import { fullIndex, getAllImageSlides, nextUID, toData } from '@/entities/SlideShowUtils'
import { Button, ButtonSet, useConfirmDialog } from '@/modules/dialog/confirmDialog'
import LabelEditorDialog from '@/dialogs/LabelEditorDialog.vue'
import ImageSlideBox from '@/components/ImageSlideBox.vue'
import TriggerSettingsPopup from '@/components/TriggerSettingsPopup.vue'
import useSlideShowApi from '@/api/slideShowApi'
import { useSnackbarStore } from '@/modules/snackbar/snackbarStore'
import PreviewDialog from '@/dialogs/PreviewDialog.vue'

const editorApi = useEditorApi()
const resourceApi = useResourceApi()
const editorStore = useEditorStore()
const createConfirmDialog = useConfirmDialog()!

const slideShowLoaded = ref(false)
const slideShow: Ref<SlideShow> = ref({ slides: [] })
const totalSlides = computed(() => slideShow.value.slides.flatMap((s) => s.type === 'group' ? s.slides.length : 1).reduce((sum, current) => sum + current, 0))
const header = ref()
const reelToolbar = ref()
const reelStatusBar = ref()
const basketStatusBar = ref()

const headerSize = useElementSize(header)
const reelToolbarSize = useElementSize(reelToolbar)
const windowSize = useWindowSize()
const statusBarSize = useElementSize(reelStatusBar)

const boxHeight = computed(() => {
  return 'height:' + (windowSize.height.value - headerSize.height.value - reelToolbarSize.height.value - statusBarSize.height.value - 14) + 'px'
})

const openedGroups = ref<number[]>([])

onMounted(async () => {
  console.log('editorStore', editorStore.slideShow)
  if (editorStore.slideShow == null) {
    await editorStore.reloadSlideShow()
    // await editorStore.setCurrentSlideShow('gallery/iceland', 'marci')
  }
  slideShow.value = editorStore.slideShow!
  console.log('slideShow', slideShow.value)
  if (slideShow.value) {
    slideShowLoaded.value = true
    openedGroups.value.slice(0, openedGroups.value.length)
    slideShow.value.slides.forEach((slide: Slide) => {
      if (slide.type === 'group') {
        openedGroups.value.push(slide.uid)
        slide.slides.forEach((slide: ImageSlide) => {
          if (slide.thumbnail === undefined) {
            resourceApi.requestThumbnail(slide.imageName).then((response) => {
              slide.thumbnail = URL.createObjectURL(response)
            }).catch((error) => {
              console.error('Error loading thumbnail', error)
              slide.missing = true
            })
          }
        })
      } else {
        resourceApi.requestThumbnail(slide.imageName).then((response) => {
          slide.thumbnail = URL.createObjectURL(response)
        }).catch((error) => {
          console.error('Error loading thumbnail', error)
          slide.missing = true
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

const basketList = ref<BasketItem[]>([])
const unusedItemsInBasket = computed(() => basketList.value.filter((item) => item.usedInSlideShow === false))

//
function deleteSlide(slide: Slide) {
  reelConfirmRemoveItems([slide])
}

// TODO: Note, this has a bug in 3.7.1, but fixed, so next version will be OK
function toggleOpen(slide: GroupSlide) {
  if (openedGroups.value.includes(slide.uid)) {
    const i = openedGroups.value.indexOf(slide.uid)
    openedGroups.value.splice(i, 1)
  } else {
    openedGroups.value.push(slide.uid)
  }
}

// =====================================================================================================================
// Preview
// =====================================================================================================================

const previewSlide = ref<ImageSlide | undefined>()
const previewVisible = ref(false)

function preview(slide: ImageSlide) {
  previewSlide.value = slide
  previewVisible.value = true
}

// =====================================================================================================================
// Drag and drop base
// =====================================================================================================================

type DragTargetInfo = {
  nextSlide: Slide | undefined
  group: GroupSlide | undefined
  type: 'slide' | 'marker'
  invalid?: boolean | undefined
}

enum DragType {
  BASKET_TO_REEL = 'basket-to-reel',
  REEL_REORDER = 'reel-reorder',
  NEW_GROUP = 'new-group',
}

type DragHandler = {
  type: DragType,
  validator: (target: DragTargetInfo) => boolean,
  dropHandler: (target: DragTargetInfo) => void
  dragEndHandler: (target: DragTargetInfo | undefined) => void
}

const dragHandler = ref<DragHandler | undefined>()
// const dragType = ref<DragType | undefined>()
const dragSelectedItems = ref<Slide[] | BasketItem[]>([])
const dragHolderThumbnail = ref<string | undefined>()

const dragTarget = ref<undefined | DragTargetInfo>()

const blockDragCounter = ref(0)
const slideDragCounter = ref(0)

function setDragTarget(target: DragTargetInfo | undefined) {
  function setMarkerColor(c: string) {
    const key = dragTarget.value?.group?.uid + '.' + dragTarget?.value?.nextSlide?.uid
    const element = document.getElementById(key)
    if (element) {
      element.style.backgroundColor = c
    }
  }

  setMarkerColor('')
  dragTarget.value = target
  if (target) {
    setMarkerColor(target.invalid ? '' : (target.group ? '#139ff7' : '#f7b613'))
  }
}

function clearDragTarget() {
  setDragTarget(undefined)
}

function handleSlideDragEnter(event: DragEvent, slide: Slide | undefined, isMarker: boolean = false) {
  // if (event.target === event.currentTarget || (event.currentTarget as Node).contains(event.target as Node)) {
  slideDragCounter.value++
  event.stopPropagation()
  event.preventDefault()
  const isUp = event.offsetY < 40
  const inGroup = slide?.type === 'image' && slide?.group !== undefined
  let group = inGroup ? slide!.group! : undefined
  // console.log(`Drag enter on slide marker=${isMarker} offset=${event.offsetY} isUp=${isUp} inGroup=${inGroup} counter=${slideDragCounter.value}`, slide)
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
    newTarget = {
      nextSlide,
      group,
      type: isMarker ? 'marker' : 'slide'
    }
  }

  newTarget.invalid = dragHandler.value?.validator(newTarget) === false
  if (newTarget.type === dragTarget.value?.type && newTarget.group === dragTarget.value?.group && newTarget.nextSlide === dragTarget.value?.nextSlide) {
    return
  }
  // console.log('Drag target', newTarget.nextSlide?.index, inGroup)
  setDragTarget(newTarget)
}

function handleSlideDragLeave(event: DragEvent, isMarker: boolean = false) {
  slideDragCounter.value--
  if (slideDragCounter.value <= 0) {
    if (dragTarget.value?.type === (isMarker ? 'marker' : 'slide')) {
      // console.log('Drag leave slide', isMarker)
      clearDragTarget()
      slideDragCounter.value = 0
    }
    // }
  }
  event.stopPropagation()
  event.preventDefault()
}

const dragHolderTopImage = ref<HTMLImageElement>()

function initializeDragHolder(event: DragEvent) {
  const dragPreview = document.getElementById('dragHolder')!
  dragPreview.style.display = 'flex'
  // console.log('Drag holder thumbnail:', dragHolderThumbnail.value)
  if (dragHolderThumbnail.value) {
    dragHolderTopImage.value!.src = dragHolderThumbnail.value
  }
  event.dataTransfer!.setDragImage(dragPreview, 60, 40)
}

function drop(event: DragEvent, target: DragTargetInfo | undefined) {
  event.preventDefault()
  event.stopPropagation()
  // console.log('Dropped: ', toRaw(target))
  if (target && !target.invalid) {
    dragHandler.value?.dropHandler(target)
  }
}

function dragEnd(event: DragEvent) {
  event.preventDefault()
  const dragPreview = document.getElementById('dragHolder')!
  dragPreview.style.display = 'none'
  dragHandler.value?.dragEndHandler(dragTarget.value)
  clearDragTarget()
  blockDragCounter.value = 0
  slideDragCounter.value = 0
  dragHandler.value = undefined
}

function addToBasket(slide: Slide, select: boolean = false): ImageSlide[] {
  const slides: ImageSlide[] = (slide.type === 'group') ? slide.slides : [slide]

  basketList.value
    .filter((basketItem) => slides.some((item) => item.imageName === basketItem.imageName))
    .forEach((item) => {
      if (select) basketSelectedItems.value.push(item)
      item.usedInSlideShow = false
    })

  return slides
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
  // console.log('Drag start', basketSelectedItems.value.map((s) => s.thumbnail))
  dragSelectedItems.value = [...basketSelectedItems.value]
  dragHolderThumbnail.value = basketSelectedItems.value[0]?.thumbnail
  initializeDragHolder(event)
  dragHandler.value = {
    type: DragType.BASKET_TO_REEL,
    validator: () => true,
    dropHandler: dropBasketToReel,
    dragEndHandler: () => {
    }
  }
}

function dropBasketToReel(target: DragTargetInfo) {
  reelSelectedItems.value.splice(0, reelSelectedItems.value.length)
  const group = target.group
  const targetContainer = group ?? slideShow.value
  const itemsToAdd: Slide[] = []
  let index = target.nextSlide ? target.nextSlide.index! : targetContainer.slides.length + 1
  const insertIndex = index - 1
  // console.warn('Drop basket to reel', targetContainer, insertIndex)
  basketSelectedItems.value.forEach((item) => {
    const slide: ImageSlide = {
      uid: nextUID(),
      type: 'image',
      imageName: item.imageName,
      thumbnail: item.thumbnail,
      index: index++
    }
    console.log('Add slide', slide)
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
  // console.log('Updated', slideShow.value)
  basketSelectedItems.value.splice(0, basketSelectedItems.value.length)
}

// =====================================================================================================================
// REEL REORDER - Drag and drop
// =====================================================================================================================

const reelSelectedItems = ref<Slide[]>([])
const reelSelectedImageSlides = computed(() => reelSelectedItems.value.filter((s) => s.type === 'image'))
let reelLastSelectedItem: Slide | undefined

// let reelLastSelectedItemIndex: number = -1

function reelSelectItem(event: MouseEvent | KeyboardEvent, slide: Slide) {
  const itemIndex = slide.index!
  // console.log('Select item', itemIndex, slide)

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

  // console.log('Selected items', reelSelectedItems.value.map((s) => fullIndex(s)))
}

function reelDragStart(event: DragEvent, slide: Slide) {
  // console.log('Drag start', slide.index)
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
  dragSelectedItems.value = [...reelSelectedItems.value]
  dragHolderThumbnail.value = firstImage?.thumbnail
  initializeDragHolder(event)
  dragHandler.value = {
    type: DragType.REEL_REORDER,
    validator: reelIsValidDragTarget,
    dropHandler: dropReelReorder,
    dragEndHandler: endReelReorderDrag
  }
}

function reelIsValidDragTarget(target: DragTargetInfo) {
  // console.warn('Valid drag target', target)
  if (target.group !== undefined) {
    return !reelSelectedItems.value.some((s) => s.type === 'group')
  }
  return true
}

function endReelReorderDrag(dragTarget: DragTargetInfo | undefined) {
  if (!dragTarget) {
    reelConfirmRemoveItems(reelSelectedItems.value)
  }
}

function updateIndex(rootChanged: boolean, changedGroups: Set<GroupSlide>) {
  // console.log('Update index', rootChanged, changedGroups)
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
}

function dropReelReorder(target: DragTargetInfo) {
  // console.log('Reel reorder', reelSelectedItems.value.map((s) => fullIndex(s)))
  const selected = reelSelectedItems.value.filter((s) => {
    if (s.type === 'group') {
      return true
    }
    return s.group === undefined || !reelSelectedItems.value.includes(s.group)
  }).sort((s1, s2) => fullIndex(s1) < fullIndex(s2) ? -1 : 1)
  // console.log('Selected', selected.map((s) => fullIndex(s)))

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
    insertIndex = targetContainer.slides.findIndex((slide: Slide) => slide.index >= (target.nextSlide!.index))
    if (insertIndex === -1) {
      insertIndex = targetContainer.slides.length
    }
  } else {
    insertIndex = targetContainer.slides.length
  }

  // console.log('Insert at', insertIndex, targetContainer)

  targetContainer.slides.splice(insertIndex, 0, ...selected)
  updateIndex(rootChanged, changedGroups)

  // console.log('Updated', slideShow.value)
}

let removeWithoutConfirmation = false

function reelConfirmRemoveItems(items: Slide[]) {
  if (removeWithoutConfirmation) {
    reelRemoveItems(items)
  } else {
    createConfirmDialog({
      title: '@editor.deleteSlide.title',
      titleColor: 'red',
      content: '@editor.deleteSlide.message',
      buttons: ButtonSet.yesNo,
      enableRemember: true
    }).then((answer) => {
      removeWithoutConfirmation = answer.remember
      if (answer.button === Button.YES) {
        reelRemoveItems(items)
      }
    })
  }
}

function reelRemoveItems(items: Slide[]) {
  basketSelectedItems.value.splice(0, basketSelectedItems.value.length)

  const changedGroups = new Set<GroupSlide>()
  let rootChanged = false
  items.forEach((slide: Slide) => {
    const isGroup = slide.type === 'group'
    const group = isGroup ? undefined : slide.group
    const targetContainer = group ?? slideShow.value
    addToBasket(slide, true)
    targetContainer.slides.splice(slide.index - 1, 1)
    if (group) {
      changedGroups.add(group)
    } else {
      rootChanged = true
    }
  })

  updateIndex(rootChanged, changedGroups)
  reelSelectedItems.value.splice(0, reelSelectedItems.value.length)
}

// =====================================================================================================================
// NEW GROUP - Drag and drop
// =====================================================================================================================

function newGroupDragStart(event: DragEvent) {
  initializeDragHolder(event)
  dragHandler.value = {
    type: DragType.NEW_GROUP,
    validator: newGroupValidDragTarget,
    dropHandler: newGroupInsert,
    dragEndHandler: (target) => {
    }
  }
}

function newGroupValidDragTarget(target: DragTargetInfo) {
  return target.group === undefined
}

const slideRefs = ref(new Map<number, VListItem>())

function newGroupInsert(dragTarget: DragTargetInfo | undefined) {
  // console.log('insert', dragTarget)
  if (dragTarget !== undefined) {
    const index = dragTarget?.nextSlide ? dragTarget.nextSlide.index! - 1 : slideShow.value.slides.length
    const group: GroupSlide = {
      uid: nextUID(),
      type: 'group',
      index,
      slides: []
    }
    slideShow.value.slides.splice(index, 0, group)
    openedGroups.value.push(group.uid)

    updateIndex(true, new Set())

    // nextTick(() => {
    //   const newGroupElement = slideRefs.value.get(group.uid)
    //   console.log('SCR', newGroupElement)
    //   if (newGroupElement) {
    //     newGroupElement.$el.scrollIntoView({ behavior: 'instant' })
    //   }
    // })
  }
}

function save() {
  const data = toData(slideShow.value)
  useSlideShowApi().saveSlideShow(editorStore.path, editorStore.name, editorStore.originalName, data).then((response) => {
    console.log('Save response', response)
    useSnackbarStore().addSuccess('@saveSuccess')
  }).catch((error) => {
    console.error('Error saving slide show', error.response.data.error)
    useSnackbarStore().addError('@saveError.' + error.response.data.error)
  })
}

const labelEditor = ref<typeof LabelEditorDialog>()
const showLabelEditor = ref(false)

function editLabel(slide: Slide) {
  console.log('Edit label', slide, labelEditor.value)
  showLabelEditor.value = true
  nextTick(() => {
    labelEditor.value?.open(slide, slideShow.value)
  })
}

function editLabelMultiple() {
  console.log('Edit label multiple')
  showLabelEditor.value = true
  nextTick(() => {
    labelEditor.value?.open(reelSelectedItems.value.filter((s) => s.type === 'image'), slideShow.value)
  })
}

function hideLabelEditor() {
  console.log('Hide label editor')
  showLabelEditor.value = false
}

</script>
<style>
:root {
  --split-size: 60%;
}

</style>
<style>

:root {
  --split-size: 50%;
}

body {
  overflow-y: hidden;
}

.header {
  background-color: #1e1f38;
  color: whitesmoke;
}

.statusbar {
  background-color: #333333;
  width: var(--split-size);
  color: #aaaaaa;
  height: 25px;
  font-size: 80%;
  text-align: left;
  padding: 2px 10px;
  position: absolute;
  bottom: 0;
}

.reel {
  position: absolute;
  background-color: #333333;
  width: var(--split-size);
  color: whitesmoke;
  overflow-y: auto !important;
}

.reel-toolbar {
  background-color: #333333;
  width: var(--split-size);
  color: whitesmoke;
}

.basket {
  position: absolute;
  background-color: #333333;
  border-left: 1px solid whitesmoke;
  width: calc(100% - var(--split-size));
  left: var(--split-size);
  color: whitesmoke;
  overflow-y: auto;
}

.basket-toolbar {
  position: absolute;
  background-color: #333333;
  border-left: 1px solid whitesmoke;
  width: calc(100% - var(--split-size));
  color: whitesmoke;
  left: var(--split-size);
}

.basket-statusbar {
  border-left: 1px solid whitesmoke;
  left: var(--split-size);
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

.slide-index {
  margin-right: 1em;
  font-size: 150%;
  width: 50px;
  color: #ffffff80;
}

</style>
