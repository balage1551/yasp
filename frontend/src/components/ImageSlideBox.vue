<template>
            <v-list-item v-if="slide.type === 'image'" class="slide-box"
                         :class="{ 'selected': selected && !isGroupSlide, 'group-slide': isGroupSlide, 'selected-group-slide': selected && isGroupSlide }"
                         style="border-left: 2px solid transparent; "
                         v-bind="$attrs"
            >
              <template #prepend>
                <div class="slide-index">{{ fullIndex(slide)  }}</div>

                <v-img class="mr-2 thumbnail" style="width: 120px; height: 80px; background-color: #0d0d0d;"
                       :src="slide.thumbnail" aspect-ratio="1"></v-img>
                <v-icon class="missing" size="60" v-if="slide.missing === true" color="red">mdi-alert</v-icon>
              </template>
              <template #append>
                <!--                                <v-icon size="40" @click="splitBlock(block, slide)">mdi-arrow-split-horizontal</v-icon>-->
                <div style="width: 10px"></div>
                <v-icon size="40" @click="emit('delete')">mdi-delete</v-icon>

              </template>
              <v-list-item-title class="font-weight-bold mb-2">
                {{ fullIndex(slide) }} - {{ slide.imageName }}
              </v-list-item-title>
              <v-list-item-subtitle>
                <v-icon @click.stop="emit('editLabel')" :style="'color:'+ (slide.label ? 'white' : 'gray')">mdi-tag
                </v-icon>
                <v-menu :id="'trigger-'+slide.uid" location="bottom" @click.stop="">
                  <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" v-if="!slide.trigger || slide.trigger.type === 'timed'">mdi-timer
                    </v-icon>
                    <v-icon v-bind="props"
                            v-else-if="slide.trigger.type === 'key' && slide.trigger.onlyOnce !== true">mdi-keyboard
                    </v-icon>
                    <v-icon v-bind="props" v-else>mdi-keyboard-outline</v-icon>
                  </template>
                  <v-list>
                    <v-list-item prepend-icon="mdi-timer" @click="setTransition(slide, 'continue')">
                      <v-list-item-title>{{ $t('editor.transition.continue') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item prepend-icon="mdi-keyboard" @click="setTransition(slide, 'hold')">
                      <v-list-item-title>{{ $t('editor.transition.hold') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item prepend-icon="mdi-keyboard-outline" @click="setTransition(slide, 'holdOnce')">
                      <v-list-item-title>{{ $t('editor.transition.holdOnce') }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-list-item-subtitle>
            </v-list-item>
</template>
<script setup lang="ts">

import { VIcon, VImg, VList, VListItem, VListItemSubtitle, VListItemTitle, VMenu } from 'vuetify/components'
import { ImageSlide, SlideShow } from '@/entities/SlideShowTypes'
import useResourceApi from '@/api/resourceApi'
import { useAttrs } from 'vue'
import { fullIndex } from '../entities/SlideShowUtils'

// const editorApi = useEditorApi()
const resourceApi = useResourceApi()
// const editorStore = useEditorStore()
// const createConfirmDialog = useConfirmDialog()!

const props = withDefaults(defineProps<{
  slideShow: SlideShow
  slide: ImageSlide
  isGroupSlide?: boolean
  selected?: boolean
}>(), {
  isGroupSlide: false,
  selected: false
})

const emit = defineEmits(['delete', 'editLabel'])

const attrs = useAttrs()
</script>

<style>

</style>

<style scoped>

.slide-box {
  box-sizing: border-box;
  border-top: 3px solid #00000000;
  border-bottom: 3px solid #00000000;
  height: 90px;
  background-color: #555555;
  margin: 0 10px !important;
  padding-left: 24px !important;
}

.group-slide {
  background-color: #443d3d !important;
  margin-left: 8px !important;
}

.thumbnail {
  border: 1px solid #aaaaaa;
  width: 120px;
  height: 80px;
  background-color: #0d0d0d;
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

.missing {
  position: absolute;
  left: 100px;
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

.slide-index {
  margin-right: 1em;
  font-size: 150%;
  width: 50px;
  color: #ffffff80;
}

</style>
