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
        <slide-show-player v-if="play && slideShow" :slideShow="slideShow" @finished="play = false">
        </slide-show-player>
    </v-container>
  </application-layout>

</template>
<script setup lang="ts">

import { VBtn, VCard, VCardText, VCardTitle, VContainer, VIcon } from 'vuetify/components'
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
})

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

</style>
