import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import useAuthApi, { RegistrationData, RegistrationResult } from '@/api/authApi'
import { useTokenStore } from '@/stores/tokenStore'
import { UserHead } from '@/entities/UserHead'
import useUserApi from '@/api/userApi'

export const CURRENT_VERSION = 1.1

export const useUserStore =
    defineStore('user', () => {
      const permissions = ref<string[]>([])
      const currentUser = ref<UserHead>()
      const isGuest = computed(() => currentUser.value === undefined)
      const lastVersionSeen = ref<number>(0.0)

      async function login(account: string, password: string): Promise<boolean> {
        try {
          const response = await useAuthApi().login({ account, password })

          console.log('Login response', response)
          useTokenStore().token = response.token
          useTokenStore().permissions.push(...response.permissions)
          permissions.value = []
          permissions.value.push(...response.permissions)
          currentUser.value = new UserHead(response.currentUser)
          return true
        } catch (r) {
          console.log('Login failed: ', r)
          return false
        }
      }

      async function register(data: RegistrationData): Promise<RegistrationResult> {
        try {
          const response = await useAuthApi().register(data)
          console.log('Registration response', response)
          return response
        } catch (r) {
          console.log('Registration failed: ', r)
          return { success: false, errorCode: 'communicationError' }
        }
      }

      function logout() {
        return new Promise((resolve, reject) => {
          useAuthApi().logout().finally(() => {
            useTokenStore().token = undefined
            currentUser.value = undefined
            permissions.value = []
            resolve(undefined)
          })
        })
      }
      async function changePassword(password: string) : Promise<never> {
        return useUserApi().updatePassword(currentUser.value!.id, password)
      }

      return {
        currentUser,
        isGuest,
        lastVersionSeen,

        login,
        logout,
        register,
        changePassword,
      }
    },
    {
      persist: true
    }
    )
