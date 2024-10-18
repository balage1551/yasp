import { defineStore } from 'pinia'
import { ref } from 'vue'
import useResourceApi from '@/api/resourceApi'
import { useWindowSize } from '@vueuse/core'

const resourceApi = useResourceApi()

const { width: windowWidth, height: windowHeight } = useWindowSize()

export const useImageCache =
  defineStore('imageCache', () => {
    const cache = ref<Map<string, string>>(new Map())
    const imagePrefetchRequests = ref<string[]>([])

    const makeKey = (imageName: string, width: number, height: number) => {
      return width ? `${imageName}@${width}x${height}` : imageName
    }

    function fetchImage(imageName: string, width: number = windowWidth.value || 1920, height: number = windowHeight.value || 1080, resolve: ((url: string) => void) | undefined = undefined) {
      const key = makeKey(imageName, width, height)
      if (width && height) {
        resourceApi.requestThumbnail(imageName, width, height)
          .then(response => {
            const url = register(key, response, true)
            if (resolve) {
              resolve(url)
            }
          })
          .catch(() => {
            // TODO: Handle error
          })
      } else {
        resourceApi.requestImage(imageName)
          .then(response => {
            const url = register(key, response, true)
            if (resolve) {
              resolve(url)
            }
          })
          .catch(() => {
            // TODO: Handle error
          })
      }
    }

    async function getImage(imageName: string, useCache: boolean = false, width: number = windowWidth.value, height: number = windowHeight.value): Promise<string> {
      const key = makeKey(imageName, width, height)
      console.warn('getImage', key, useCache, cache.value.has(key))
      if (useCache && cache.value.has(key)) {
        return Promise.resolve(cache.value.get(key) || '')
      } else {
        return new Promise((resolve, reject) => {
          fetchImage(imageName, width, height, resolve)
        })
      }
    }

    function register(key: string, blob: Blob, useCache: boolean): string {
      const url = URL.createObjectURL(blob)
      if (useCache) {
        addToCache(key, url)
        console.log('register', key, [...cache.value.keys()])
      }
      return url
    }

    function addToCache(imageName: string, image: string) {
      cache.value.set(imageName, image)
    }

    return {

      getImage,
      fetchImage
    }
  }
  )
