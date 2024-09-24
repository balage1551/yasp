import { defineStore } from 'pinia'
import { ref } from 'vue'
import { SlideShow } from '@/entities/SlideShowTypes'
import useSlideShowApi from '@/api/slideShowApi'
import { processSlideShowData } from '@/entities/SlideShowUtils'

export const useEditorStore =
  defineStore('editor', () => {
    const enabled = ref<boolean>(false)
    const path = ref<string >('')
    const name = ref<string >('')
    const originalName = ref<string >('')
    const slideShow = ref<SlideShow | undefined>(undefined)

    async function setCurrentSlideShow(p: string, n : string) {
      return useSlideShowApi().requestSlideShow(p, n).then((response) => {
        path.value = p
        name.value = n
        originalName.value = n
        slideShow.value = processSlideShowData(response)
        return slideShow.value
      })
    }

    return {
      path,
      name,
      originalName,
      enabled,
      slideShow,

      setCurrentSlideShow
    }
  },
  {
    persist: true
  })
