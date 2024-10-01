<template>
  <application-layout>

    <v-container fluid class="pa-0 ma-0 ">
      <div class="image-container">
        <v-card v-if="!play" class="slide-show-info">
          <v-card-title class="slide-show-info-title">
            {{ $t('slideShowInfo.title') }}
            <v-btn v-if="editable" @click="createNew" color="gray" class="float-end" variant="flat">{{
                $t('slideShowInfo.new')
              }}
            </v-btn>
          </v-card-title>
          <v-card-text class="slide-show-info-details" v-if="(slideShowList?.length ?? 0) > 0">
            <table>
              <tr v-for="ss in slideShowList"  class="row" :key="ss.name">
                <td class="info-label">{{ ss.name }}</td>
                <td class="info-value">
                  <v-btn @click="startPlay(ss)" color="primary" variant="flat">
                    <v-icon>mdi-play</v-icon>
                  </v-btn>
                  <v-btn v-if="editable" @click="startEditor(ss)" color="green" variant="flat" class="ml-5">
                    <v-icon>mdi-movie-edit</v-icon>
                  </v-btn>
                  <v-btn v-if="editable" @click="deleteSlideShow(ss)" color="red" variant="flat" class="ml-5">
                    <v-icon>mdi-trash-can</v-icon>
                  </v-btn>
                </td>
              </tr>
            </table>
          </v-card-text>
        </v-card>
        <slide-show-player v-if="play && slideShow" :slideShow="slideShow" @finished="play = false">
        </slide-show-player>
      </div>
    </v-container>
  </application-layout>

</template>
<script setup lang="ts">

import { VBtn, VCard, VCardText, VCardTitle, VContainer, VIcon } from 'vuetify/components'
import { onMounted, ref, shallowRef, ShallowRef } from 'vue'
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

onMounted(() => {
  refresh()
})

function refresh() {
  useSlideShowApi().listSlideShows().then((response) => {
    console.log('response', response)
    path.value = response.path
    useEditorStore().enabled = response.editable
    editable.value = response.editable
    slideShowList.value = response.slideShows
  })
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
  width: 40%;
  margin-left: 30%;
  margin-top: 10%;
}

.slide-show-info-title {
  background-color: #8689ea;
  color: whitesmoke;
}

.slide-show-info-details {
  padding: 5px;
}

.info-label {
  text-align: left;
  font-weight: bold;
  padding: 2px 10px 2px 5px;
}

.row {
  height: 50px;
}

</style>
