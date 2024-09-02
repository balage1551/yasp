import { createI18n } from 'vue-i18n'
import { messages } from '@/plugins/i18n/messages'

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'hu',
  fallbackLocale: 'wn',
  reloadOnLanguageChange: true,
  fallbackWarn: false,
  messages,
})

export default i18n
