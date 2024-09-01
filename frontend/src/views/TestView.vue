<template>
  <application-layout>

    <v-container fluid class="pa-0 ma-0 ">
      <div class="image-container">
        <slide-show-player :slideShow="slideShow" >
        </slide-show-player>
      </div>
    </v-container>
  </application-layout>

</template>
<script setup lang="ts">

import { VContainer } from 'vuetify/components'
import { shallowRef, ShallowRef } from 'vue'
import ApplicationLayout from '@/layouts/ApplicationLayout.vue'
import { SlideShowInfo } from '@/entities/ImageSlideInfo'
import SlideShowPlayer from '@/components/SlideShowPlayer.vue'

const slideShow: ShallowRef<SlideShowInfo> = shallowRef({
  blocks: [
    {
      slides: [
        {
          imageName: '20240812-102654-0004.jpg',
          label: {
            text: 'Reykjavik',
            size: '5%',
            color: '#333333',
            top: '25%',
            left: '40%',
            outlined: {
              color: '#aaaaaa',
              width: 2
            }
          }
        },
        {
          imageName: '20240813-101736-0016.jpg',
          label: {
            text: 'Rubber whales',
            top: '50',
            left: '100',
          },
          trigger: {
            type: 'key',
            onlyOnce: true
          }
        },
        {
          imageName: '20240812-182703-0013.jpg'
        }
      ],
      atTheEnd: {
        type: 'loop'
      }
    },
    {
      slides: [
        {
          imageName: '20240814-093824-0021.jpg'
        },
        {
          imageName: '20240814-145737-0031.jpg'
        }
      ],
      atTheEnd: {
        type: 'hold'
      }
    }
  ]
})

</script>

<style scoped>
</style>
