import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import i18n from '@/plugins/i18n/i18n'
import { messages, SupportedLanguages } from '@/plugins/i18n/messages'

const { locale } = i18n.global

export const useLocaleStore =
  defineStore('locale', () => {
    locale.value = 'hu'

    const language = ref<SupportedLanguages>('hu')

    watch(language, (newLocale : SupportedLanguages) => {
      console.log('Locale changed to ', newLocale)
      // A persisted language may no longer be (or never have been) supported
      locale.value = newLocale in messages ? newLocale : 'hu'
    },
    { immediate: true }
    )

    return {
      language
    }
  },
  {
    persist: true
  })
