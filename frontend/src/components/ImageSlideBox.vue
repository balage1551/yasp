<template>
            <v-list-item v-if="slide.type === 'image'" class="slide-box"
                         :class="{ 'selected': selected && !isGroupSlide, 'group-slide': isGroupSlide, 'selected-group-slide': selected && isGroupSlide }"
                         style="border-left: 2px solid transparent; "
                         v-bind="$attrs"
            >
              <template #prepend>
                <div class="slide-index">{{ fullIndex(slide)  }}</div>

                <v-img v-if="slide.missing !== true" class="mr-2 thumbnail" style="width: 120px; height: 80px; background-color: #0d0d0d;"
                       :src="slide.thumbnail" aspect-ratio="1" @click="emit('preview')"></v-img>
                <div v-else class="thumbnail mr-2" >
                  <v-icon class="justify-center" size="60"  color="red">mdi-alert</v-icon>
                </div>
              </template>
              <template #append>
                <div style="width: 10px"></div>
                <v-icon size="40" @click="emit('delete')">mdi-delete</v-icon>

              </template>
              <v-list-item-title class="font-weight-bold mb-2">
                {{ fullIndex(slide) }} - {{ slide.imageName }}
              </v-list-item-title>
              <v-list-item-subtitle>
                <v-icon @click.stop="emit('editLabel')" :style="'color:'+ (slide.label ? 'white' : 'gray')">mdi-tag
                </v-icon>
                <trigger-settings-popup v-model="slide.trigger" :inherited="inheritedTrigger" ></trigger-settings-popup>
              </v-list-item-subtitle>
            </v-list-item>
</template>
<script setup lang="ts">

import { VIcon, VImg, VListItem, VListItemSubtitle, VListItemTitle } from 'vuetify/components'
import { DEFAULT_GROUP_SLIDE_TRIGGER, DEFAULT_TRIGGER, ImageSlide, SlideShow, Trigger } from '@/entities/SlideShowTypes'
import useResourceApi from '@/api/resourceApi'
import { computed, useAttrs } from 'vue'
import { fullIndex } from '@/entities/SlideShowUtils'
import TriggerSettingsPopup from '@/components/TriggerSettingsPopup.vue'

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

const emit = defineEmits(['delete', 'editLabel', 'preview'])

const attrs = useAttrs()

const inheritedTrigger = computed(() => {
  let trigger: Trigger | undefined
  if (props.slide.group) {
    trigger = props.slide.group.trigger
    if (trigger === undefined) {
      trigger = props.slideShow.groupSlideTrigger ?? DEFAULT_GROUP_SLIDE_TRIGGER
    }
  } else {
    trigger = props.slideShow.trigger ?? DEFAULT_TRIGGER
  }
  return trigger
})

</script>

<style>

</style>

<style scoped>

.slide-box {
  box-sizing: border-box;
  border-top: 3px solid #00000000;
  border-bottom: 3px solid #00000000;
  height: 94px;
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
  display: flex;
  justify-content: center;
  align-items: center;
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
  left: 130px;
  top: 15px;
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
