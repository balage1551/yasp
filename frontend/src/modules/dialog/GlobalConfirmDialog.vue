<template>
    <v-dialog
      v-model="isOpen"
      :max-width="width"
      :persistent="persistent"
    >
      <v-card>
        <v-card-title :class="titleColorName">
            <v-icon v-if="icon !== undefined" class="mr-2">
                {{ icon }}
            </v-icon>
            {{ title }}
        </v-card-title>
        <v-card-text v-show="!!content">
          <div v-for="(l,i) in lines" :key="i">{{ l }}</div>
        </v-card-text>
        <v-card-actions class="pt-2 bg-grey-lighten-3">
          <v-checkbox v-if="enableRemember" v-model="remember" dense hide-details label="Remember my choice"></v-checkbox>
          <v-spacer></v-spacer>
          <v-btn
            v-for="b in buttons" :key="b.key"
            :color="buttonColor(b)"
            :variant="buttonVariant"
            @click="fireButton(b.key)"
          >
            {{ buttonLabel(b) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { VBtn, VCard, VCardActions, VCardText, VCardTitle, VCheckbox, VDialog, VIcon, VSpacer } from 'vuetify/components'
import {
  Button,
  ButtonSet,
  ConfirmDialogAnswer,
  ConfirmDialogButton,
  CreateConfirmDialogOptions,
  getConfigDialogDefaults
} from './confirmDialog'
import { computed, ref } from 'vue'
import { Optional } from '@/utils/typeScriptUtils'
import { useI18n } from 'vue-i18n'

const i18n = useI18n()

const isOpen = ref(false)

const width = ref<string | number>(300)
const persistent = ref(true)

const title = ref('')
const titleColor = ref('')
const titleColorName = computed(() => {
  if (titleColor.value === '') return ''
  return 'bg-' + titleColor.value
})
const icon = ref<Optional<string>>()

const content = ref<Optional<string>>('')
const lines = computed(() => (content.value ?? '').split('\n'))

const buttons = ref<ConfirmDialogButton[]>()
const buttonVariant = ref<typeof VBtn.variant>('flat')
const resolveCallback = ref<(key: ConfirmDialogAnswer) => void>()

const enableRemember = ref(false)
const remember = ref(false)

const createConfirmDialog = (
  dialogOptions: CreateConfirmDialogOptions = {},
) => {
  const defaults = getConfigDialogDefaults()
  let t = dialogOptions.title ?? defaults.title ?? ''
  title.value = t.startsWith('@') ? i18n.t(t.substring(1)) : t
  titleColor.value = dialogOptions.titleColor ?? defaults.titleColor ?? 'bg-blue'
  t = dialogOptions.content ?? ''
  content.value = t.startsWith('@') ? i18n.t(t.substring(1)) : t
  width.value = dialogOptions.width ?? defaults.width ?? 300
  persistent.value = dialogOptions.persistent !== false || defaults.persistent !== false
  icon.value = dialogOptions.icon ?? defaults.icon
  buttons.value = dialogOptions.buttons ?? defaults.buttons ?? ButtonSet.ok
  buttonVariant.value = dialogOptions.buttonVariant ?? defaults.buttonVariant ?? 'text'
  isOpen.value = true
  console.log('dialogOptions', dialogOptions, dialogOptions.enableRemember, defaults.enableRemember, dialogOptions.enableRemember ?? defaults.enableRemember ?? false)
  enableRemember.value = dialogOptions.enableRemember ?? defaults.enableRemember ?? false
  remember.value = false
  return new Promise<ConfirmDialogAnswer>((resolve) => {
    resolveCallback.value = resolve
  })
}

defineExpose({ createConfirmDialog })

function buttonLabel(b: ConfirmDialogButton) {
  if (b.label !== undefined) {
    if (b.label.startsWith('@')) {
      return i18n.t(b.label.substring(1))
    } else {
      return b.label
    }
  } else {
    return i18n.t('common.' + b.key)
  }
}

function buttonColor(b: ConfirmDialogButton) {
  if (b.color !== undefined) {
    return b.color
  } else {
    switch (b.key) {
      case Button.OK:
        return 'secondary'
      case Button.CANCEL:
        return 'darkgrey'
      case Button.YES:
        return 'secondary'
      case Button.NO:
        return 'primary'
      default:
        return 'primary'
    }
  }
}

const fireButton = (key: string) => {
  if (resolveCallback.value) {
    resolveCallback.value({
      button: key,
      remember: remember.value
    })
  }
  isOpen.value = false
}

</script>
