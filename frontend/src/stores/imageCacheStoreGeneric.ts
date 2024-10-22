import useResourceApi from '@/api/resourceApi'
import { useWindowSize } from '@vueuse/core'
import { defineCacheStore } from '@/stores/cacheStore'

const resourceApi = useResourceApi()

const { width: windowWidth, height: windowHeight } = useWindowSize()

export type ImageCacheContext = {
  imageName: string
  width: number
  height: number
}

export const useGeneralImageCacheStore = defineCacheStore<ImageCacheContext, string>('imageCache2', {
  keyFactory: (context: ImageCacheContext) => {
    return `${context.imageName}@${context.width ?? windowWidth.value}x${context.height ?? windowHeight.value}`
  },

  fetch: async (context: ImageCacheContext) => {
    const { imageName, width, height } = context
    return resourceApi.requestThumbnail(imageName, width, height).then(response => URL.createObjectURL(response))
  }
}, { debugLevel: 3 })
