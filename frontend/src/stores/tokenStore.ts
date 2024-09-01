import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Token {
    header: string
    value: string
    prefix: string
    expiration: number
}

export const useTokenStore =
  defineStore('token', () => {
    const token = ref<string>()
    const permissions = ref<string[]>([])

    function resetToken() {
      return new Promise((resolve) => {
        token.value = undefined
        resolve(undefined)
      })
    }

    function hasPermission(permission?: string) : boolean {
      if (permission === undefined) {
        return true
      }
      return permissions.value.includes(permission)
    }

    return {
      token,
      permissions,

      resetToken,
      hasPermission
    }
  },
  {
    persist: true
  })
