<template>
  <application-layout>

    <v-container fluid class="pa-0 ma-0 ">
        <v-card v-if="!play" class="slide-show-info">
          <v-card-title class="slide-show-info-title">
            <span @click="unlockAttempt">{{ $t('slideShowInfo.title') }}</span>
            <v-btn v-if="editorVisible" @click="createNew" color="gray" class="float-end" variant="flat">{{
                $t('slideShowInfo.new')
              }}
            </v-btn>
          </v-card-title>
          <v-card-text class="slide-show-info-details" v-if="(slideShowList?.length ?? 0) > 0">
            <table class="mx-2">
              <tr v-for="ss in slideShowList"  class="row" :key="ss.name">
                <td class="info-label">{{ ss.name }}</td>
                <td class="info-value" style="padding-right: 3em;">
                  <v-btn @click="startPlay(ss)" color="primary" variant="flat">
                    <v-icon>mdi-play</v-icon>
                  </v-btn>
                </td>
                <td class="info-value">
                  <v-btn v-if="editorVisible" @click="startEditor(ss)" color="green" variant="flat" class="mr-3">
                    <v-icon>mdi-movie-edit</v-icon>
                  </v-btn>
                </td>
                <td class="info-value">
                  <v-btn v-if="editorVisible" @click="deleteSlideShow(ss)" color="red" variant="flat" >
                    <v-icon>mdi-trash-can</v-icon>
                  </v-btn>
                </td>
              </tr>
            </table>
          </v-card-text>
        </v-card>

      <v-card v-if="!play" class="slide-show-info">
        <v-card-title class="slide-show-info-title">
          Cache Tester
        </v-card-title>
        <v-card-text class="slide-show-info-details">
          <v-btn @click="testAddSet1">Add set 1</v-btn>
          <v-btn class="ml-3" @click="testAddSet2">Add set 2 (clear)</v-btn>
          <div class="mt-2"> {{ cache.statistics }} </div>
          <v-sheet ref="cacheState" class="cacheState" >
            <div v-for="n in cache.statistics.cached" :key="n" class="cacheBox cacheBoxReady"></div>
            <div v-if="cache.statistics.hasRequestInProgress" class="cacheBox cacheBoxInProgress"></div>
            <div v-for="n in cache.statistics.pending" :key="n" class="cacheBox cacheBoxPending"></div>
          </v-sheet>
        </v-card-text>
      </v-card>
        <slide-show-player v-if="play && slideShow" :slideShow="slideShow" @finished="play = false">
        </slide-show-player>
    </v-container>
  </application-layout>

</template>
<script setup lang="ts">

import { VBtn, VCard, VCardText, VCardTitle, VContainer, VIcon, VSheet } from 'vuetify/components'
import { computed, onMounted, ref, shallowRef, ShallowRef } from 'vue'
import ApplicationLayout from '@/layouts/ApplicationLayout.vue'
import { SlideShow } from '@/entities/SlideShowTypes'
import SlideShowPlayer from '@/components/SlideShowPlayer.vue'
import useSlideShowApi, { SlideShowListItem } from '@/api/slideShowApi'
import { processSlideShowData } from '@/entities/SlideShowUtils'
import { useEditorStore } from '@/stores/editorStore'
import { useRouter } from 'vue-router'
import { Button, ButtonSet, useConfirmDialog } from '@/modules/dialog/confirmDialog'
import { useI18n } from 'vue-i18n'
import { useSnackbarStore } from '@/modules/snackbar/snackbarStore'
import { useGeneralImageCacheStore } from '@/stores/imageCacheStoreGeneric'

const createConfirmDialog = useConfirmDialog()!
const i18n = useI18n()

const slideShow: ShallowRef<undefined | SlideShow> = shallowRef()
const play = ref(false)

const path = ref<string>('')
const editable = ref<boolean>(false)
const slideShowList = ref<SlideShowListItem[]>([])

const unlocked = ref(false)

const editorVisible = computed(() => editable.value && unlocked.value)

onMounted(() => {
  refresh()
  testGenericCacheStore()
})

const cache = useGeneralImageCacheStore()

function testGenericCacheStore() {
  cache.request({ imageName: 'IMG-20240814-141932-0051.jpg', width: 100, height: 100 })
  cache.request({ imageName: 'IMG-20240812-105710-0010.jpg', width: 100, height: 100 }, {
    resolver: (res) => {
      console.log('Received', res)
      cache.request({ imageName: 'IMG-20240812-105710-0010.jpg', width: 100, height: 100 }, {
        resolver: (res) => {
          console.log('Received again', res)
        }
      })
    }
  })
  cache.request({ imageName: 'IMG-20240812-183049-0021.jpg', width: 100, height: 100 }, { immediate: true })
}

function testAddSet1() {
  cache.batchRequest(
    [
      { imageName: 'IMG-20240812-182904-0020.jpg' },
      { imageName: 'IMG-20240812-183049-0021.jpg' },
      { context: { imageName: 'IMG-20240812-185726-0022.jpg' } },
      { context: { imageName: 'IMG-20240813-101424-0023.jpg' }, immediate: true },
      { imageName: 'IMG-20240813-101736-0024.jpg' }
    ], {
      common: { width: 100, height: 100 },
    })
}

function testAddSet2() {
  cache.batchRequest(
    [
      { imageName: 'IMG-20240814-101117-0035.jpg' },
      { imageName: 'IMG-20240812-183049-0021.jpg' },
      { context: { imageName: 'IMG-20240813-215014-0032.jpg' } },
      { context: { imageName: 'IMG-20240813-101424-0023.jpg' }, immediate: true },
      { imageName: 'IMG-20240814-094643-0034.jpg' },
      { imageName: 'IMG-20240814-104507-0040.jpg' }
    ], {
      common: { width: 100, height: 100 },
      clearQueue: true,
      clearCache: true
    })
}

function refresh() {
  useSlideShowApi().listSlideShows().then((response) => {
    console.log('response', response)
    path.value = response.path
    useEditorStore().enabled = response.editable
    useEditorStore().locked = response.locked
    unlocked.value = !response.locked
    editable.value = response.editable
    slideShowList.value = response.slideShows
  })
}

let unlockCounter = 0
let unlockTimeout: NodeJS.Timeout | undefined

function unlockAttempt() {
  clearTimeout(unlockTimeout)
  unlockCounter++
  if (unlockCounter >= 5) {
    unlocked.value = true
  } else {
    setTimeout(() => {
      unlockCounter = 0
    }, 1000)
  }
}

function createNew() {
  useEditorStore().createNewSlideShow(path.value)
  router.push({ name: 'Editor' })
}

function startPlay(ss: SlideShowListItem) {
  useSlideShowApi().requestSlideShow(path.value, ss.name).then((response) => {
    slideShow.value = processSlideShowData(response)
    play.value = true
  })
}

const router = useRouter()

function startEditor(ss: SlideShowListItem) {
  useEditorStore().setCurrentSlideShow(path.value, ss.name).then(() => {
    router.push({ name: 'Editor' })
  })
}

function deleteSlideShow(ss: SlideShowListItem) {
  createConfirmDialog({
    title: '@dashboard.deleteSlideShow.title',
    titleColor: 'red',
    content: i18n.t('dashboard.deleteSlideShow.message', { name: ss.name }),
    buttons: ButtonSet.yesNo
  }).then((answer) => {
    if (answer.button === Button.YES) {
      useSlideShowApi().deleteSlideShow(path.value, ss.name).then(() => {
        useSnackbarStore().addSuccess('dashboard.deleteSlideShow.success')
        refresh()
      })
    }
  })
  // useSlideShowApi().deleteSlideShow(path.value, ss.name).then(() => {
  //   useSlideShowApi().listSlideShows().then((response) => {
  //     slideShowList.value = response.slideShows
  //   })
  // })
}

</script>

<style scoped>

.slide-show-info {
  width: 90%;
  max-width: 400px;
  margin: 10% auto;
}

.slide-show-info-title {
  background-color: #143d96;
  color: whitesmoke;
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none;    /* Firefox */
  -ms-user-select: none;     /* Internet Explorer/Edge */
  user-select: none;         /* Standard syntax */
}

.slide-show-info-details {
  padding: 5px;
  background-color: #333333;
  color: whitesmoke;
}

.info-label {
  width: 100%;
  text-align: left;
  font-weight: bold;
  padding: 2px 0;
}

.row {
  height: 70px;
}

.cacheState {
  height: 2em;
  padding: 5px;
  background-color: #88888880;
  z-index: 2000;
}

.cacheBox {
  width: 0.75em;
  height: 0.75em;
  margin: 0 0.10em;
  display: inline-block;
}

.cacheBoxReady {
  background-color: #0077cb;
}

.cacheBoxInProgress {
  background-color: #a98c00;
}

.cacheBoxPending {
  background-color: #004372;
}

</style>
