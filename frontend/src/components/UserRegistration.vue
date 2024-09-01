<template>
  <div>
    <v-container fluid>
      <v-card class="pa-5 mt-5 mx-auto text-start" :width="constrainWidth(800, 90)">
        <v-card-title>
          <h3 class="text-center">{{ $t('registration.title') }}</h3>
        </v-card-title>
        <v-card-text>
          <v-form ref="registrationForm">
            <v-container>
              <v-row>

                <v-col :cols="12" :md="6">
                  <v-text-field density="compact" variant="outlined"
                                v-model="registrationFormData.accountName" :rules="accountRules"
                                :label="$t('registration.account')" required></v-text-field>
                </v-col>
                <v-col :cols="12" :md="6">
                  <v-text-field density="compact" variant="outlined"
                                v-model="registrationFormData.nickname" :rules="nicknameRules"
                                :label="$t('registration.nickname')" required></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col :cols="12" :md="6">
                  <v-text-field density="compact" variant="outlined"
                                v-model="registrationFormData.surname" :rules="surnameRules"
                                :label="$t('registration.surname')" required></v-text-field>
                </v-col>
                <v-col :cols="12" :md="6">
                  <v-text-field density="compact" variant="outlined"
                                v-model="registrationFormData.firstName" :rules="firstNameRules"
                                :label="$t('registration.firstName')" required></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col :cols="12" :md="6">
                  <v-text-field density="compact" variant="outlined"
                                v-model="registrationFormData.email" :rules="emailRules"
                                :label="$t('registration.email')"
                                required></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col :cols="12" :md="6">
                  <v-text-field density="compact" variant="outlined"
                                v-model="registrationFormData.password" :rules="passwordRules"
                                :label="$t('registration.password')" :type="showPassword ? 'text' : 'password'"
                                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                @click:append="handleShowPass"></v-text-field>
                </v-col>

                <v-col :cols="12" :md="6">
                  <v-text-field density="compact" variant="outlined"
                                v-model="registrationFormData.passwordAgain" :rules="passwordRules"
                                :label="$t('registration.passwordAgain')" :type="showPassword ? 'text' : 'password'"
                                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                @click:append="handleShowPass"></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-form>

        </v-card-text>
          <v-card-actions class="justify-end">
            <v-spacer></v-spacer>
            <v-btn
              id="button-login"
              color="primary"
              :loading="loading"
              @click.prevent="handleRegistration">
              {{ $t('registration.register') }}
            </v-btn>
          </v-card-actions>
      </v-card>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, unref, watch } from 'vue'
import { validateIsTheSame, validateMinLength, validateRequired } from '@/utils/validation-utils'
import {
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VCardTitle,
  VCol,
  VContainer,
  VForm,
  VRow,
  VSpacer,
  VTextField
} from 'vuetify/components'
import { useRouter } from 'vue-router'
import { useSnackbarStore } from '@/modules/snackbar/snackbarStore'
import { constrainWidth } from '@/utils/vuetifyUtils'
import { useUserStore } from '@/stores/userStore'
import { RegistrationResult } from '@/api/authApi'
import { accountRules, emailRules, firstNameRules, nicknameRules, surnameRules } from '@/components/BaseDataValidators'

const snackbarStore = useSnackbarStore()
const router = useRouter()

const registrationForm = ref<VForm>()
const showPassword = ref(false)

const registrationFormData = reactive({
  accountName: '',
  firstName: '',
  surname: '',
  nickname: '',
  email: '',
  password: '',
  passwordAgain: ''
})

const handleShowPass = () => {
  showPassword.value = !showPassword.value
}

const loading = ref(false)

const passwordRules = [
  (v: string) => validateRequired(v, 'registration.password'),
  (v: string) => validateMinLength(v, 'registration.password', 6),
  () => validateIsTheSame(registrationFormData.password, registrationFormData.passwordAgain, 'registration.passwordMismatch')
]

watch(registrationFormData, () => {
  if (registrationFormData.password && registrationFormData.passwordAgain) registrationForm.value!.validate()
}, { deep: true })

// Methods
async function handleRegistration() {
  const { valid } = await registrationForm.value!.validate()
  if (valid) {
    loading.value = true
    useUserStore().register(unref(registrationFormData))
      .then((resp : RegistrationResult) => {
        console.log('Logged in.')
        if (resp.success) {
          router.push({
            name: 'Login'
          })
        } else {
          snackbarStore.addError('@registration.' + resp.errorCode!)
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
</script>
<style scoped>

.login-btn {
  background-color: var(--pmi-blue);
}

.logo {
  max-height: 5em;
}

.super {
  font-size: 70%;
  font-weight: bold;
  vertical-align: top;
  color: red;
  padding-left: 2px;
}

</style>
