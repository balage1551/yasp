import { defineStore, PiniaPluginContext } from 'pinia'
import { ref } from 'vue'
import { DEFAULT_GROUP_SLIDE_TRIGGER, DEFAULT_GROUP_TRIGGER, DEFAULT_TRIGGER, SlideShow } from '@/entities/SlideShowTypes'
import useSlideShowApi from '@/api/slideShowApi'
import { processSlideShowData } from '@/entities/SlideShowUtils'

export const useEditorStore =
  defineStore('editor', () => {
    const enabled = ref<boolean>(false)
    const path = ref<string>('')
    const name = ref<string>('')
    const originalName = ref<string>('')
    const slideShow = ref<SlideShow | undefined>(undefined)

    async function setCurrentSlideShow(p: string, n: string) {
      path.value = p
      name.value = n
      originalName.value = n
      return reloadSlideShow()
    }

    async function reloadSlideShow() {
      return useSlideShowApi().requestSlideShow(path.value, name.value).then((response) => {
        console.log('reloadSlideShow', response)
        slideShow.value = processSlideShowData(response)
      })
    }

    function createNewSlideShow(p: string) {
      path.value = p
      name.value = 'vetítés'
      originalName.value = 'vetítés'
      slideShow.value = processSlideShowData({
        trigger: DEFAULT_TRIGGER,
        groupTrigger: DEFAULT_GROUP_TRIGGER,
        groupSlideTrigger: DEFAULT_GROUP_SLIDE_TRIGGER,
        slides: []
      })
      return slideShow.value
    }

    return {
      path,
      name,
      originalName,
      enabled,
      slideShow,

      setCurrentSlideShow,
      createNewSlideShow,
      reloadSlideShow
    }
  },
  {
    persist: {
      omit: ['slideShow'],
      afterHydrate: async (state: PiniaPluginContext) => {
        if (state.store.path.value && state.store.name.value) {
          console.log('afterHydrate', state.store.path.value, state.store.name.value)
          state.store.slideShow = await state.store.reloadSlideShow()
        }
      }
    }
  }
  )
