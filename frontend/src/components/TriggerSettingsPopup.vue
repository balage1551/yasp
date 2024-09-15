<template>
  <v-menu location="bottom" @click.stop="" @update:modelValue="showHide">
    <template v-slot:activator="{ props }">
      <v-icon v-bind="props" v-if="type === 'timed'" class="trigger" :class="{ 'inherited' : isInherited }">mdi-timer
      </v-icon>
      <v-icon v-bind="props" v-else-if="type === 'key'" class="trigger" :class="{ 'inherited' : isInherited }">
        mdi-mouse
      </v-icon>
    </template>
    <v-sheet class="v-list pa-4 box">
      <div class="py-1 mb-2 trigger-selector">
        <v-icon :class="{ 'trigger-selected': !isInherited && activeTrigger.type=== 'timed'}"
                @click.stop="setType('timed')">mdi-timer
        </v-icon>
        <v-icon :class="{ 'trigger-selected': !isInherited && activeTrigger.type=== 'key'}"
                @click.stop="setType('key')">mdi-mouse
        </v-icon>
        <v-icon :class="{ 'trigger-selected': isInherited }" class="float-end" @click.stop="setType(undefined)">
          mdi-chevron-double-down
        </v-icon>
      </div>
      <div v-if="type === 'timed'">
        <v-text-field :disabled="isInherited" @click.stop hide-details density="compact" variant="outlined"
                      v-model="activeTrigger.time"></v-text-field>
      </div>
      <div v-if="type === 'key'">
        <v-checkbox v-for="key in possibleKeys" :key="key" @click.stop :label="key" v-model="activeTrigger.keys"
                    :value="key" :disabled="isInherited"
                    hide-details class="key-checks"
        ></v-checkbox>
      </div>
    </v-sheet>
  </v-menu>

</template>
<script setup lang="ts">

import { VCheckbox, VIcon, VMenu, VSheet, VTextField } from 'vuetify/components'
import { DEFAULT_TRIGGER_KEYS, DEFAULT_TRIGGER_TIME, Trigger } from '@/entities/SlideShowTypes'
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{
  modelValue: Trigger | undefined
  inherited: Trigger
}>()

const emit = defineEmits(['update:modelValue'])

const activeTrigger = ref<Trigger | undefined>()
const isInherited = ref<boolean>(activeTrigger.value === undefined)
const type = computed(() => activeTrigger.value?.type ?? props.inherited.type)
const possibleKeys = ['enter', 'space', 'tab']

onMounted(() => {
  showHide(true)
})

function showHide(state: boolean) {
  console.log('trigger: ', props.modelValue, props.inherited)
  console.log('deactivated', state)
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
        keys: props.inherited.type === 'key' ? props.inherited.key : DEFAULT_TRIGGER_KEYS
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
    activeTrigger.value = { ...(props.modelValue ?? props.inherited) }
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
  color: #f1a700;
}

.inherited {
  color: lightyellow;
}

.trigger-selector {
  color: gray;
}

.trigger-selected {
  color: #f1a700;
}

.key-checks {
  color: white;
}

</style>
