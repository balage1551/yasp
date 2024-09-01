// noinspection JSUnusedGlobalSymbols

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { SnackPacket, SnackTaste } from '@/modules/snackbar/GlobalSnackbarTypes'
import i18n from '@/plugins/i18n/i18n'

const { t } = i18n.global

export const useSnackbarStore =
    defineStore('snackbar', () => {
      const messages = ref<SnackPacket[]>([])
      const callback = ref<(packet?: SnackPacket) => void>()

      /** General snackbar message creation. */
      function addMessage(taste: SnackTaste, message: string, color?: string, timeout?: number) {
        const msg = message.startsWith('@') ? t(message.substring(1)) : message
        const packet : SnackPacket = {
          message: msg,
          color: color ?? taste.color,
          timeout: timeout ?? taste.defaultTimeout
        }
        if (callback.value) callback.value(packet)
      }

      function resetMessages() {
        if (callback.value) callback.value()
      }

      function addInfo(message: string) {
        addMessage(SnackTaste.INFO, message)
      }

      function addSuccess(message: string) {
        addMessage(SnackTaste.SUCCESS, message)
      }

      function addWarning(message: string) {
        addMessage(SnackTaste.WARNING, message)
      }

      function addError(message: string) {
        addMessage(SnackTaste.ERROR, message)
      }

      return {
        messages,
        callback,

        addMessage,
        addInfo,
        addSuccess,
        addWarning,
        addError,
        resetMessages
      }
    })
