<template>
  <application-layout>

    <v-container fluid class="pa-0 ma-0 ">
      <div class="image-container">
        <v-card v-if="slideShow && !play" class="slide-show-info">
          <v-card-title class="slide-show-info-title">
            {{ $t('slideShowInfo.title') }}
          </v-card-title>
          <v-card-text class="slide-show-info-details">
            <table>
              <tr>
                <td class="info-label">{{ $t('slideShowInfo.details.numberOfSlides') }}</td>
                <td class="info-value">{{ slideShow.totalSlides }}</td>
              </tr>
              <tr>
                <td class="info-label">{{ $t('slideShowInfo.details.numberOfBlocks') }}</td>
                <td class="info-value">{{ slideShow.blocks.length }}</td>
              </tr>
            </table>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="play = true" color="primary" variant="flat">{{ $t('slideShowInfo.play') }}</v-btn>
          </v-card-actions>
        </v-card>
        <slide-show-player v-if="play && slideShow" :slideShow="slideShow" @finished="play = false">
        </slide-show-player>
      </div>
    </v-container>
  </application-layout>

</template>
<script setup lang="ts">

import { VBtn, VCard, VCardActions, VCardText, VCardTitle, VContainer, VSpacer } from 'vuetify/components'
import { onMounted, ref, shallowRef, ShallowRef } from 'vue'
import ApplicationLayout from '@/layouts/ApplicationLayout.vue'
import { SlideShowInfo } from '@/entities/SlideShowTypes'
import SlideShowPlayer from '@/components/SlideShowPlayer.vue'
import useSlideShowApi from '@/api/slideShowApi'
import { processSlideShowData } from '@/entities/SlideShowUtils'

const slideShow: ShallowRef<undefined | SlideShowInfo> = shallowRef()
const play = ref(false)

onMounted(() => {
  useSlideShowApi().requestSlideShow('gallery/test', 'test').then((response) => {
    slideShow.value = processSlideShowData(response)
    // play.value = true
  })
})

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
