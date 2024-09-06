<template>
  <application-layout>

    <v-container fluid class="pa-0 ma-0 ">
      <div class="image-container">
        <v-card v-if="!play" class="slide-show-info">
          <v-card-title class="slide-show-info-title">
            {{ $t('slideShowInfo.title') }}
            <v-btn v-if="editable" @click="play = true" color="gray" class="float-end" variant="flat">{{
                $t('slideShowInfo.new')
              }}
            </v-btn>
          </v-card-title>
          <v-card-text class="slide-show-info-details" v-if="slideShowList.length > 0">
            <table>
              <tr v-for="ss in slideShowList" :key="ss.name">
                <td class="info-label">{{ ss.name }}</td>
                <td class="info-value">
                  <v-btn @click="startPlay(ss)" color="primary" variant="flat">{{ $t('slideShowInfo.play') }}</v-btn>
                  <v-btn v-if="editable" @click="startEditor(ss)" color="green" variant="flat" class="ml-5">{{
                      $t('slideShowInfo.edit')
                    }}
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

import { VBtn, VCard, VCardText, VCardTitle, VContainer } from 'vuetify/components'
import { onMounted, ref, shallowRef, ShallowRef } from 'vue'
import ApplicationLayout from '@/layouts/ApplicationLayout.vue'
import { SlideShowInfo } from '@/entities/SlideShowTypes'
import SlideShowPlayer from '@/components/SlideShowPlayer.vue'
import useSlideShowApi, { SlideShowListItem } from '@/api/slideShowApi'
import { processSlideShowData } from '@/entities/SlideShowUtils'
import { useEditorStore } from '@/stores/editorStore'
import { useRouter } from 'vue-router'

const slideShow: ShallowRef<undefined | SlideShowInfo> = shallowRef()
const play = ref(false)

const path = ref<string>('')
const editable = ref<boolean>(false)
const slideShowList = ref<SlideShowListItem[]>([])

onMounted(() => {
  useSlideShowApi().listSlideShows().then((response) => {
    console.log('response', response)
    path.value = response.path
    useEditorStore().enabled = response.editable
    editable.value = response.editable
    slideShowList.value = response.slideShows
    // slideShow.value = processSlideShowData(response)
    // play.value = true
  })
})

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

</style>
