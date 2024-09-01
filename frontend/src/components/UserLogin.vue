<template>
  <div>
    <v-img src="mole.png" class="logo"></v-img>
    <application-title :size="40"></application-title>
    <v-container>
      <v-row>
        <v-col>
          <v-card
            class="pa-5 mt-5 card-background mx-auto" :width="constrainWidth(800, 90)"
          >
            <v-card-title>
              <h3>
                {{ $t('login.title') }}</h3>
            </v-card-title>

            <v-card-text>
              <v-form
                ref="loginForm">

                <v-text-field
                  density="compact"
                  variant="outlined"
                  persistant-hint
                  class="mb-5"
                  id="input-login-email"
                  :label="$t('login.account')"
                  :rules="accountRules"
                  autocomplete="username"
                  v-model="loginData.account"
                ></v-text-field>

                <v-text-field
                  density="compact"
                  variant="outlined"
                  persistant-hint
                  id="input-login-password"
                  v-model="loginData.password"
                  :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="showPassword ? 'text' : 'password'"
                  :rules="passwordRules"
                  name="input-10-1"
                  :label="$t('login.password')"
                  autocomplete="current-password"
                  @click:append="showPassword = !showPassword"
                  @keyup.enter="handleLogin"
                ></v-text-field>
              </v-form>
            </v-card-text>

            <v-card-actions class="justify-end">
              <v-btn variant="text" @click="openRegistration">{{ $t('login.register')}}</v-btn>
              <v-spacer></v-spacer>
              <v-btn
                id="button-login"
                color="primary"
                :loading="loading"
                @click.prevent="handleLogin">
                {{ $t('login.title') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>

</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { validateRequired } from '@/utils/validation-utils'
import {
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VCardTitle,
  VCol,
  VContainer,
  VForm,
  VImg,
  VRow,
  VSpacer,
  VTextField
} from 'vuetify/components'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { useSnackbarStore } from '@/modules/snackbar/snackbarStore'
import i18n from '@/plugins/i18n/i18n'
import { constrainWidth } from '@/utils/vuetifyUtils'
import ApplicationTitle from '@/components/ApplicationTitle.vue'

console.log(i18n.global.locale.value)

const snackbarStore = useSnackbarStore()
const router = useRouter()

const loading = ref(false)
const loginData = reactive({
  account: '',
  password: ''
})

const showPassword = ref(false)

const accountRules = [
  (v: string) => validateRequired(v, 'login.account')
]

const passwordRules = [
  (v: string) => validateRequired(v, 'login.password')
]

const loginForm = ref<VForm>()

// Methods
async function handleLogin() {
  const { valid } = await loginForm.value!.validate()
  // console.log(valid, errors)
  if (valid) {
    loading.value = true
    useUserStore().login(loginData.account, loginData.password)
      .then((success) => {
        console.log('Logged in.')
        if (success) {
          router.push({
            name: 'Dashboard'
          })
        } else {
          snackbarStore.addError('@login.error')
        }
      })
      .catch((e) => {
        console.error('ERR', e)
        snackbarStore.addError('@login.redirectionError')
      })
      .finally(() => {
        loading.value = false
      })
  }
}

function openRegistration() {
  router.push({
    name: 'Registration'
  })
}
</script>
<style scoped>

.logo {
  margin-top: 3em;
  max-height: 10em;
}

.super {
  font-size: 70%;
  font-weight: bold;
  vertical-align: top;
  color: red;
  padding-left: 2px;
}

</style>
