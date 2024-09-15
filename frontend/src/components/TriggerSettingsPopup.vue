<template>
  <v-menu location="bottom" @click.stop="" @update:modelValue="showHide">
    <template v-slot:activator="{ props }">
      <v-icon v-bind="props" v-if="type === 'timed'" class="trigger" :class="{ 'inherited' : isInherited }">mdi-timer
      </v-icon>
      <v-icon v-bind="props" v-else-if="type === 'key'" class="trigger" :class="{ 'inherited' : isInherited }">
        mdi-mouse
      </v-icon>
    </template>
    <v-sheet class="v-list pa-4 box" @click.stop>
      <div class="py-1 mb-2 trigger-selector">
        <v-icon :class="{ 'trigger-selected': !isInherited && activeTrigger?.type=== 'timed', 'trigger-inherited': isInherited && props.inherited.type === 'timed'}"
                @click.stop="setType('timed')">mdi-timer
        </v-icon>
        <v-icon :class="{ 'trigger-selected': !isInherited && activeTrigger?.type=== 'key', 'trigger-inherited': isInherited && props.inherited.type === 'key'}"
                @click.stop="setType('key')">mdi-mouse
        </v-icon>
        <v-icon :class="{ 'trigger-selected': isInherited }" class="float-end" @click.stop="setType(undefined)">
          mdi-chevron-double-down
        </v-icon>
      </div>
      <div v-if="type === 'timed'">
        <v-text-field :disabled="isInherited" @click.stop hide-details density="compact" variant="outlined"
                      v-model="(activeTrigger as TimedTrigger).time"></v-text-field>
      </div>
      <div v-if="type === 'key'">
        <v-checkbox v-for="key in POSSIBLE_KEYS" :key="key" @click.stop :label="key" v-model="(activeTrigger as KeyTrigger).keys"
                    :value="key" :disabled="isInherited"
                    hide-details class="key-checks"
        ></v-checkbox>
      </div>
    </v-sheet>
  </v-menu>

</template>
<script setup lang="ts">

import { VCheckbox, VIcon, VMenu, VSheet, VTextField } from 'vuetify/components'
import {
  DEFAULT_TRIGGER_KEYS,
  DEFAULT_TRIGGER_TIME,
  KeyTrigger,
  POSSIBLE_KEYS,
  TimedTrigger,
  Trigger
} from '@/entities/SlideShowTypes'
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{
  modelValue: Trigger | undefined
  inherited: Trigger
}>()

const emit = defineEmits(['update:modelValue'])

const activeTrigger = ref<Trigger | undefined>()
const isInherited = ref<boolean>(activeTrigger.value === undefined)
const type = computed(() => activeTrigger.value?.type ?? props.inherited.type)

onMounted(() => {
  showHide(true)
})

function showHide(state: boolean) {
  if (state) {
    activeTrigger.value = { ...(props.modelValue ?? props.inherited) }
    isInherited.value = props.modelValue === undefined
  } else {
    emit('update:modelValue', activeTrigger.value)
  }
}

function setType(newType: 'key' | 'timed' | undefined) {
  if (newType) {
    if (newType === 'key') {
      activeTrigger.value = {
        type: 'key',
        keys: props.inherited.type === 'key' ? props.inherited.keys : DEFAULT_TRIGGER_KEYS
      }
      isInherited.value = false
    } else {
      activeTrigger.value = {
        type: 'timed',
        time: props.inherited.type === 'timed' ? props.inherited.time : DEFAULT_TRIGGER_TIME
      }
      isInherited.value = false
    }
  } else {
    activeTrigger.value = { ...props.inherited }
    isInherited.value = true
  }
}

</script>

<style scoped>

.box {
  width: 200px;
  overflow: hidden;
}

.trigger {
  color: #22a456;
}

.inherited {
  color: #e7af4e;
}

.trigger-selector {
  color: gray;
}

.trigger-selected {
  color: #22a456;
}

.trigger-inherited {
  color: #e7af4e;
}

.key-checks {
  color: white;
}

</style>
