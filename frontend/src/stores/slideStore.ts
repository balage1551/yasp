import { defineStore } from 'pinia'
import { ref } from 'vue'
import { LabelInfo } from '@/entities/SlideShowTypes'

export const useSlideStore =
  defineStore('slide', () => {
    const labelDefaults = ref<LabelInfo>({
      text: '',
      size: '5%',
      color: 'black',
      top: '10%',
      left: '10%',
      outlined: {
        color: '#aaaaaa',
        width: 2
      }
    })

    return {
      labelDefaults,
    }
  },
  {
    persist: false
  })
