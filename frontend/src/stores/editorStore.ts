import { defineStore } from 'pinia'
import { ref } from 'vue'
import { SlideShowInfo } from '@/entities/SlideShowTypes'

export const useEditorStore =
  defineStore('editor', () => {
    const path = ref<string>('')
    const slideShow = ref<SlideShowInfo | null>(null)

    return {
      path,
      slideShow
    }
  },
  {
    persist: false
  })
