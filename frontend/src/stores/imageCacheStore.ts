import { defineStore } from 'pinia'
import { ref } from 'vue'
import useResourceApi from '@/api/resourceApi'
import { EventBusKey, useEventBus, useWindowSize } from '@vueuse/core'
import { ImageSlide } from '@/entities/SlideShowTypes'

const resourceApi = useResourceApi()

const { width: windowWidth, height: windowHeight } = useWindowSize()

type PrefetchRequest = {
  key: string
  imageName: string
  width: number
  height: number,
  resolvers: ((url: string) => void)[]
}

let prefetchTimer: NodeJS.Timeout | undefined
// The request taken off the queue whose fetch the timer is about to start.
let prefetchScheduled: PrefetchRequest | undefined
// Whether the (single) prefetch chain is running: a fetch of it is scheduled or in flight.
let prefetchBusy = false

// Images loaded outside the cache (thumbnails) are fetched with this many requests at most at once.
const MAX_PARALLEL_UNCACHED = 4

export type UncachedImageLoad = {
  // Resolves to an object URL owned by the caller (revoke it when no longer shown).
  promise: Promise<string>
  // Drops the load if it has not started yet; a started one resolves to nothing.
  cancel: () => void
}

export type ImageCacheUpdateEvent = {
  cached: number
  pending: number
}

export type ImageCacheLoadEvent = {
  imageName: string,
  success: boolean,
  url?: string
}

export const imageCacheLoadBusKey: EventBusKey<ImageCacheLoadEvent> = Symbol('imageCacheOnLoad')
export const imageCacheOnLoadBus = useEventBus(imageCacheLoadBusKey)

export const imageCacheUpdateBusKey: EventBusKey<ImageCacheUpdateEvent> = Symbol('imageCache')
export const imageCacheOnUpdateBus = useEventBus(imageCacheUpdateBusKey)

export const useImageCache =
  defineStore('imageCache', () => {
    const cache = ref<Map<string, string>>(new Map())
    const imagePrefetchRequests = ref<PrefetchRequest[]>([])

    const makeKey = (imageName: string, width: number, height: number) => {
      return width ? `${imageName}@${width}x${height}` : imageName
    }

    function keyToImageName(key: string): string {
      return key.split('@')[0]
    }

    function requestImagePrefetch(requestedImages: string | ImageSlide[], width: number = windowWidth.value || 1920, height: number = windowHeight.value || 1080) {
      let imageNames: string[]
      if (Array.isArray(requestedImages)) {
        imageNames = requestedImages.map((image: ImageSlide) => image.imageName)
      } else {
        imageNames = [requestedImages]
      }
      stopPrefetching()
      console.log('Requesting prefetch', imageNames, width, height)
      const originalKeys = new Set(imagePrefetchRequests.value.map(request => request.key))
      const requestedKeys = new Set<string>()
      const stat = { new: 0, alreadyQueued: 0, cached: 0, removed: 0 }
      console.log('Current prefetch requests', [...originalKeys])
      imageNames.forEach(name => {
        const key = makeKey(name, width, height)
        const alreadyCached = cache.value.has(key)
        const alreadyRequested = imagePrefetchRequests.value.some(request => request.key === key)
        console.log('   Checking ', key, alreadyCached, alreadyRequested)
        if (!alreadyCached && !alreadyRequested) {
          imagePrefetchRequests.value.push({ key, imageName: name, width, height, resolvers: [] })
          requestedKeys.add(key)
          stat.new++
          console.log('   Registering ', key)
        } else {
          if (alreadyRequested) {
            requestedKeys.add(key)
            stat.alreadyQueued++
          }
          if (alreadyCached) {
            requestedKeys.add(key)
            stat.cached++
          }
          originalKeys.delete(key)
        }
      })
      console.log('Removing old prefetch requests', originalKeys)
      originalKeys.forEach(key => removeRequest(key, true))
      console.log('New prefetch requests', imagePrefetchRequests.value.map(request => request.key))
      const cacheKeys: string[] = [...cache.value.keys()]
      console.log(cacheKeys, requestedKeys)
      cacheKeys.filter(key => !requestedKeys.has(key)).forEach(key => {
        cache.value.delete(key)
        console.log('remove', key, [...cache.value.keys()])
        stat.removed++
      })

      console.log(cache.value.size)
      console.log(`Prefetch request stats: ${cache.value.size} cached, ${imagePrefetchRequests.value.length} pending, ${stat.new} new requests, ${stat.alreadyQueued} already queued, ${stat.cached} already cached, ${stat.removed} removed`)
      imageCacheOnUpdateBus.emit({ cached: cache.value.size, pending: imagePrefetchRequests.value.length })
      startPrefetching()
    }

    function removeRequest(key: string, cleanup: boolean = false) {
      const requestIndex = imagePrefetchRequests.value.findIndex(request => request.key === key)
      const request = imagePrefetchRequests.value[requestIndex]
      if (requestIndex >= 0) {
        imagePrefetchRequests.value.splice(requestIndex, 1)
        console.log('   Removing ', key)
      }
      if (cleanup) {
        cache.value.delete(key)
        console.log('   Cleaning up ', key)
      }
      console.log('Remaining prefetch requests', imagePrefetchRequests.value.map(request => request.key))
      imageCacheOnUpdateBus.emit({ cached: cache.value.size, pending: imagePrefetchRequests.value.length })
      return request
    }

    function stopPrefetching() {
      if (prefetchTimer) {
        console.log('Stopping prefetching')
        clearTimeout(prefetchTimer)
        prefetchTimer = undefined
        // Its fetch never started: give the request back to the queue (with its waiters).
        if (prefetchScheduled) {
          imagePrefetchRequests.value.unshift(prefetchScheduled)
          prefetchScheduled = undefined
        }
        prefetchBusy = false
      }
    }

    // Starts the prefetch chain unless it is already running: only one prefetch is in flight at
    // a time, each finished one starts the next.
    function startPrefetching() {
      if (prefetchBusy) {
        return
      }
      console.log('Starting prefetching', imagePrefetchRequests.value.length)
      if (imagePrefetchRequests.value.length > 0) {
        const request = imagePrefetchRequests.value.shift()!
        console.log('   Fetching ', request.key)
        prefetchBusy = true
        prefetchScheduled = request
        prefetchTimer = setTimeout(() => prefetcing(request), 100)
      }
    }

    function prefetcing(request: PrefetchRequest) {
      prefetchTimer = undefined
      prefetchScheduled = undefined
      // startPrefetching() has already taken the request off the queue, so its waiters travel
      // with the fetch instead of being looked up there when the image arrives.
      fetchImage(request.imageName, request.width, request.height, true, url => request.resolvers.forEach(resolve => resolve(url)), true)
    }

    function onImageFetched(key: string, response: Blob, useCache: boolean, resolve?: (url: string) => void) {
      console.log('   onImageFetched', key, useCache)
      const url = register(key, response, useCache)
      resolve?.(url)
      // Waiters that queued the same image again while it was being fetched.
      const request = removeRequest(key)
      request?.resolvers.forEach(waiter => waiter(url))
      imageCacheOnLoadBus.emit({ imageName: keyToImageName(key), success: true, url })
      if (useCache) {
        imageCacheOnUpdateBus.emit({ cached: cache.value.size, pending: imagePrefetchRequests.value.length })
      }
    }

    function onImageFetchFailed(key: string) {
      console.log('onImageFetchFailed', key)
      imageCacheOnLoadBus.emit({ imageName: keyToImageName(key), success: false })
      removeRequest(key)
    }

    function fetchImage(
      imageName: string,
      width: number = windowWidth.value || 1920,
      height: number = windowHeight.value || 1080,
      useCache: boolean = false,
      resolve: ((url: string) => void) | undefined = undefined,
      prefetch: boolean = false
    ) {
      console.log('fetchImage', imageName, width, height)
      const key = makeKey(imageName, width, height)
      let apiRequest: Promise<Blob>
      if (width && height) {
        apiRequest = resourceApi.requestThumbnail(imageName, width, height)
      } else {
        apiRequest = resourceApi.requestImage(imageName)
      }
      apiRequest
        .then(response => {
          onImageFetched(key, response, useCache, resolve)
        })
        .catch(() => {
          onImageFetchFailed(key)
        })
        .finally(() => {
          if (prefetch) {
            prefetchBusy = false
          }
          // Continues the chain, or restarts it if it went idle while requests were waiting.
          startPrefetching()
        })
    }

    async function getImage(imageName: string, useCache: boolean = false, width: number = windowWidth.value, height: number = windowHeight.value): Promise<string> {
      const key = makeKey(imageName, width, height)
      console.warn('getImage', key, useCache, cache.value.has(key))
      if (useCache && cache.value.has(key)) {
        return Promise.resolve(cache.value.get(key) || '')
      } else {
        return new Promise((resolve, reject) => {
          fetchImage(imageName, width, height, useCache, resolve)
        })
      }
    }

    async function waitForImage(imageName: string, width: number = windowWidth.value, height: number = windowHeight.value, clear: boolean = false): Promise<string | undefined> {
      const key = makeKey(imageName, width, height)
      console.log('waitForImage', key, clear)
      if (cache.value.has(key)) {
        return Promise.resolve(cache.value.get(key) || '')
      } else {
        return new Promise<string>((resolve) => {
          let req: PrefetchRequest | undefined = imagePrefetchRequests.value.find(request => request.key === key)
          if (req === undefined) {
            req = { key, imageName, width, height, resolvers: [] }
            imagePrefetchRequests.value.splice(0, 0, req)
          }
          req.resolvers.push(resolve)
          startPrefetching()
        })
      }
    }

    const uncachedWaiting: (() => void)[] = []
    let uncachedActive = 0

    function pumpUncached() {
      const free = MAX_PARALLEL_UNCACHED - uncachedActive
      // Each start raises uncachedActive
      uncachedWaiting.splice(0, Math.max(0, free)).forEach(start => start())
    }

    /**
     * Loads an image (a thumbnail if a size is given) bypassing the cache and the prefetch queue,
     * which serve the slideshow itself. Meant for the many small images of the slide lists.
     */
    function loadUncached(imageName: string, width?: number, height?: number): UncachedImageLoad {
      let cancelled = false
      let start: (() => void) | undefined
      const promise = new Promise<string>((resolve, reject) => {
        start = () => {
          start = undefined
          uncachedActive++
          const apiRequest = (width && height)
            ? resourceApi.requestThumbnail(imageName, width, height)
            : resourceApi.requestImage(imageName)
          apiRequest
            .then((blob) => {
              if (!cancelled) {
                resolve(URL.createObjectURL(blob))
              }
            })
            .catch(reject)
            .finally(() => {
              uncachedActive--
              pumpUncached()
            })
        }
        uncachedWaiting.push(start)
        pumpUncached()
      })
      return {
        promise,
        cancel: () => {
          cancelled = true
          if (start) {
            const index = uncachedWaiting.indexOf(start)
            if (index >= 0) {
              uncachedWaiting.splice(index, 1)
            }
          }
        }
      }
    }

    function register(key: string, blob: Blob, useCache: boolean): string {
      const url = URL.createObjectURL(blob)
      if (useCache) {
        addToCache(key, url)
        console.log('register', key, cache.value.size)
      }
      return url
    }

    function addToCache(imageName: string, image: string) {
      cache.value.set(imageName, image)
    }

    return {

      getImage,
      waitForImage,
      loadUncached,
      fetchImage,
      requestImagePrefetch
    }
  }
  )
