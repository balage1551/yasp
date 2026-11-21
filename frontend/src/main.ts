import { App as VueApp, createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import { createPinia } from 'pinia' // Ensure you are using css-loader
import 'vuetify/dist/vuetify.min.css'
import i18n from '@/plugins/i18n/i18n'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})

const pinia = createPinia()
// Prefixed: on the server the app shares its origin (and so localStorage) with other apps, whose
// stores have the same names (e.g. naboo's token and locale).
pinia.use(createPersistedState({ key: (storeKey) => `yasp.${storeKey}` }))

const app: VueApp<Element> = createApp(App)
  .use(i18n)
  .use(pinia)
  .use(router)
  .use(vuetify)

app.mount('#app')
