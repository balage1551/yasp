import { defineStore } from 'pinia'
import { computed, ref, watchEffect } from 'vue'
import { ShallowReactiveMap } from '@/utils/ShallowReactiveMap'

export type CacheRequestContext = object

export type CacheRequest<C extends CacheRequestContext, R> = {
  key: string
  useCache: boolean
  context: C
  resolvers: ((result: R) => void)[]
}

export type RequestOptions<R> = {
  useCache?: boolean,
  immediate?: boolean,
  resolver?: ((response: R) => void) | undefined
}

export type BatchRequestOptions<C> = {
  common?: Partial<C>,
  useCache?: boolean,
  clearQueue?: boolean,
  clearCache?: boolean
}

export type CacheStoreConfig<C extends CacheRequestContext, R> = {
  keyFactory: ((context: C) => string)
  fetch: ((context: C) => Promise<R>)
}

export type CacheStoreOptions = {
  requestDelay?: number
  debugLevel?: 0 | 1 | 2 | 3
}

export const defineCacheStore = <C extends CacheRequestContext, R>(
  name: string,
  cacheConfig: CacheStoreConfig<C, R>,
  options: CacheStoreOptions = {}
) => defineStore(name, () => {
    const config = cacheConfig
    const requests = ref<CacheRequest<C, R>[]>([])
    const inProgressRequest = ref<CacheRequest<C, R> | undefined>(undefined)
    const debugLevel = options.debugLevel || 0

    const requestInProgress = computed(() => inProgressRequest.value !== undefined)

    function debug(level: number, ...message: unknown[]) {
      if (debugLevel >= level) {
        console.log(...message)
      }
    }

    function request(context: C, options: RequestOptions<R> = {}) {
      const key = config.keyFactory(context)
      const useCache = options.useCache ?? true
      debug(2, 'Requesting', key, useCache ? '(cached)' : '', options.immediate ? '(prio)' : '', options.resolver ? '(resolving)' : '')
      if (useCache && cache.has(key)) {
        debug(2, '   Cached data found.')
        if (options.resolver) {
          const result: R = cache.get(key)!
          options.resolver(result)
        }
      } else {
        const request: CacheRequest<C, R> = {
          key,
          useCache,
          context: context as C,
          resolvers: options.resolver ? [options.resolver] : []
        }
        debug(1, '   Requesting data from API:', request)
        // TODO: Why does it marked as error
        if (options.immediate) {
        // @ts-ignore
          requests.value.splice(0, 0, request)
        } else {
        // @ts-ignore
          requests.value.push(request)
        }
        debug(2, '   Request queue:', requests.value.map(request => request.key))
        start()
      }
    }

    function removeRequest(key: string) {
      const index = requests.value.findIndex(request => request.key === key)
      if (index >= 0) {
        requests.value.splice(index, 1)
        debug(2, '   Removing request:', key)
      } else if (key === inProgressRequest.value?.key) {
        inProgressRequest.value = undefined
        debug(2, '   Cancelling request:', key)
      }
    }

    function batchRequest(batchRequests: (Partial<C> | {context: Partial<C>, immediate?: boolean})[], options: BatchRequestOptions<C> = {}) {
      debug(1, 'Batch requesting data:', batchRequests, options)
      const common = options.common || {}
      const stat = { new: 0, alreadyQueued: 0, cached: 0, removedFromCache: 0, removedFromQueue: 0 }
      const cachedKeys: Set<string> = new Set([...cache.keys()])
      const requestedKeys: Set<string> = new Set(requests.value.map(request => request.key))
      const inProgressKey = inProgressRequest.value ? inProgressRequest.value.key : undefined
      if (inProgressKey) {
        requestedKeys.add(inProgressKey)
      }
      batchRequests.forEach(r => {
        let ctx: C
        let immediate = false
        if ((r as {context: C}).context) {
          ctx = (r as {context: C}).context
          immediate = (r as {immediate?: boolean}).immediate || false
        } else {
          ctx = r as C
        }
        ctx = { ...common, ...ctx }
        const key = config.keyFactory(ctx)
        const fetched = cache.has(key)
        let queued = requestedKeys.has(key)
        if (queued && immediate && inProgressKey !== key) {
          removeRequest(key)
          queued = false
        }
        if (fetched) {
          stat.cached++
          cachedKeys.delete(key)
          debug(3, '   Data already cached:', key)
        } else if (queued) {
          stat.alreadyQueued++
          requestedKeys.delete(key)
          debug(3, '   Request already queued:', key)
        } else {
          debug(2, '   Adding request:', key, ctx, immediate ? '(prio)' : '')
          request(ctx, { useCache: options.useCache, immediate })
        }
      })
      if (options.clearQueue) {
        requestedKeys.forEach(key => {
          removeRequest(key)
          stat.removedFromQueue++
        })
      }
      if (options.clearCache) {
        cachedKeys.forEach(key => {
          unregister(key)
          stat.removedFromCache++
        })
      }

      debug(1, `Batch request stats: ${cache.size} cached, ${requests.value.length} pending, ${stat.new} new requests, ${stat.alreadyQueued} already queued, ${stat.cached} already cached, ${stat.removedFromCache} removed from cache, ${stat.removedFromQueue} removed from queue`)

      restart()
    }

    // =================================================================================================================
    // ==== CACHE HANDLING =============================================================================================
    // =================================================================================================================

    const cache = new ShallowReactiveMap<string, R>()
    const statistics = computed(() => {
      return {
        cached: cache.size,
        pending: requests.value.length,
        hasRequestInProgress: requestInProgress.value
      }
    })

    watchEffect(() => {
      debug(2, `Cache: ${cache.size}+${requestInProgress.value ? '1' : '0'}+${requests.value.length}`)
    })

    function register(key: string, response: R) {
      debug(2, '   Registering data:', key, response)
      cache.set(key, response)
    }

    function unregister(key: string) {
      if (cache.has(key)) {
        debug(2, '   Unregistering data:', key)
        cache.delete(key)
      }
    }

    // =================================================================================================================
    // ==== FETCH QUEUE ================================================================================================
    // =================================================================================================================

    let timer: NodeJS.Timeout | undefined

    function stop() {
      if (timer) {
        debug(2, 'Stopping request timer')
        clearTimeout(timer)
        timer = undefined
      }
    }

    function start() {
      if (!timer) {
        debug(2, 'Starting request timer')
        timer = setTimeout(() => {
          processRequest()
        }, options.requestDelay || 10)
      }
    }

    function restart() {
      stop()
      start()
    }

    function processRequest() {
      if (requests.value.length > 0) {
        const request = requests.value.shift()
        inProgressRequest.value = request
        if (request) {
          debug(2, 'Processing request:', request.key)
          config
            .fetch(request.context as C)
            .then(response => {
              debug(1, '   Data fetched:', request.key)
              processResponse(request as CacheRequest<C, R>, response)
            }).catch(error => {
              debug(1, '   Data fetch failed:', request.key, error)
            }).finally(() => {
              inProgressRequest.value = undefined
              restart()
            })
        }
      }
    }

    function processResponse(request: CacheRequest<C, R>, response: R) {
      const key = request.key
      if (inProgressRequest.value !== undefined) {
        if (request.useCache) {
          register(key, response)
          debug(1, 'Caching data:', key)
        }
        request.resolvers.forEach(resolve => resolve(response))
      } else {
        debug(1, 'Request cancelled:', key)
      }
    }

    // =================================================================================================================
    // ==== UTILS ======================================================================================================
    // =================================================================================================================

    return {
    // Fields
      cache,

      // Getters
      statistics,

      // Methods
      request,
      batchRequest

    }
  })

// =================================================================================================================
// =================================================================================================================
// =================================================================================================================
// =================================================================================================================
// =================================================================================================================
//
// const xuseImageCache =
//   defineStore('imageCache', () => {
//     const cache = ref<Map<string, string>>(new Map())
//     const imagePrefetchRequests = ref<PrefetchRequest[]>([])
//
//     const makeKey = (imageName: string, width: number, height: number) => {
//       return width ? `${imageName}@${width}x${height}` : imageName
//     }
//
//     function keyToImageName(key: string): string {
//       return key.split('@')[0]
//     }
//
//     function requestImagePrefetch(requestedImages: string | ImageSlide[], width: number = windowWidth.value || 1920, height: number = windowHeight.value || 1080) {
//       let imageNames: string[]
//       if (Array.isArray(requestedImages)) {
//         imageNames = requestedImages.map((image: ImageSlide) => image.imageName)
//       } else {
//         imageNames = [requestedImages]
//       }
//       stopPrefetching()
//       console.log('Requesting prefetch', imageNames, width, height)
//       const originalKeys = new Set(imagePrefetchRequests.value.map(request => request.key))
//       const requestedKeys = new Set<string>()
//       const stat = { new: 0, alreadyQueued: 0, cached: 0, removed: 0 }
//       console.log('Current prefetch requests', [...originalKeys])
//       imageNames.forEach(name => {
//         const key = makeKey(name, width, height)
//         const alreadyCached = cache.value.has(key)
//         const alreadyRequested = imagePrefetchRequests.value.some(request => request.key === key)
//         console.log('   Checking ', key, alreadyCached, alreadyRequested)
//         if (!alreadyCached && !alreadyRequested) {
//           imagePrefetchRequests.value.push({ key, imageName: name, width, height, resolvers: [] })
//           requestedKeys.add(key)
//           stat.new++
//           console.log('   Registering ', key)
//         } else {
//           if (alreadyRequested) {
//             requestedKeys.add(key)
//             stat.alreadyQueued++
//           }
//           if (alreadyCached) {
//             requestedKeys.add(key)
//             stat.cached++
//           }
//           originalKeys.delete(key)
//         }
//       })
//       console.log('Removing old prefetch requests', originalKeys)
//       originalKeys.forEach(key => removeRequest(key, true))
//       console.log('New prefetch requests', imagePrefetchRequests.value.map(request => request.key))
//       const cacheKeys: string[] = [...cache.value.keys()]
//       console.log(cacheKeys, requestedKeys)
//       cacheKeys.filter(key => !requestedKeys.has(key)).forEach(key => {
//         cache.value.delete(key)
//         console.log('remove', key, [...cache.value.keys()])
//         stat.removed++
//       })
//
//       console.log(cache.value.size)
//       console.log(`Prefetch request stats: ${cache.value.size} cached, ${imagePrefetchRequests.value.length} pending, ${stat.new} new requests, ${stat.alreadyQueued} already queued, ${stat.cached} already cached, ${stat.removed} removed`)
//       imageCacheOnUpdateBus.emit({ cached: cache.value.size, pending: imagePrefetchRequests.value.length })
//       startPrefetching()
//     }
//
//     function removeRequest(key: string, cleanup: boolean = false) {
//       const requestIndex = imagePrefetchRequests.value.findIndex(request => request.key === key)
//       const request = imagePrefetchRequests.value[requestIndex]
//       if (requestIndex >= 0) {
//         imagePrefetchRequests.value.splice(requestIndex, 1)
//         console.log('   Removing ', key)
//       }
//       if (cleanup) {
//         cache.value.delete(key)
//         console.log('   Cleaning up ', key)
//       }
//       console.log('Remaining prefetch requests', imagePrefetchRequests.value.map(request => request.key))
//       imageCacheOnUpdateBus.emit({ cached: cache.value.size, pending: imagePrefetchRequests.value.length })
//       return request
//     }
//
//     function stopPrefetching() {
//       if (prefetchTimer) {
//         console.log('Stopping prefetching')
//         clearTimeout(prefetchTimer)
//       }
//       prefetchTimer = undefined
//     }
//
//     function startPrefetching() {
//       stopPrefetching()
//       console.log('Starting prefetching', imagePrefetchRequests.value.length)
//       if (imagePrefetchRequests.value.length > 0) {
//         const request = imagePrefetchRequests.value.shift()
//         console.log('   Fetching ', request?.key)
//         prefetchTimer = setTimeout(() => prefetcing(request!), 100)
//       }
//     }
//
//     function prefetcing(request: PrefetchRequest) {
//       fetchImage(request?.imageName, request?.width, request?.height, true)
//     }
//
//     function onImageFetched(key: string, response: Blob, useCache: boolean) {
//       console.log('   onImageFetched', key, useCache)
//       const url = register(key, response, useCache)
//       const request = removeRequest(key)
//       if (request) {
//         request.resolvers.forEach(resolve => resolve(url))
//       } else {
//         console.error('No request found for', key)
//       }
//       imageCacheOnLoadBus.emit({ imageName: keyToImageName(key), success: true, url })
//       if (useCache) {
//         imageCacheOnUpdateBus.emit({ cached: cache.value.size, pending: imagePrefetchRequests.value.length })
//       }
//     }
//
//     function onImageFetchFailed(key: string) {
//       console.log('onImageFetchFailed', key)
//       imageCacheOnLoadBus.emit({ imageName: keyToImageName(key), success: false })
//       removeRequest(key)
//     }
//
//     function fetchImage(
//       imageName: string,
//       width: number = windowWidth.value || 1920,
//       height: number = windowHeight.value || 1080,
//       useCache: boolean = false,
//       resolve: ((url: string) => void) | undefined = undefined
//     ) {
//       console.log('fetchImage', imageName, width, height)
//       const key = makeKey(imageName, width, height)
//       let apiRequest: Promise<Blob>
//       if (width && height) {
//         apiRequest = resourceApi.requestThumbnail(imageName, width, height)
//       } else {
//         apiRequest = resourceApi.requestImage(imageName)
//       }
//       apiRequest
//         .then(response => {
//           onImageFetched(key, response, useCache)
//         })
//         .catch(() => {
//           onImageFetchFailed(key)
//         })
//         .finally(() => {
//           startPrefetching()
//         })
//     }
//
//     async function getImage(imageName: string, useCache: boolean = false, width: number = windowWidth.value, height: number = windowHeight.value): Promise<string> {
//       const key = makeKey(imageName, width, height)
//       console.warn('getImage', key, useCache, cache.value.has(key))
//       if (useCache && cache.value.has(key)) {
//         return Promise.resolve(cache.value.get(key) || '')
//       } else {
//         return new Promise((resolve, reject) => {
//           fetchImage(imageName, width, height, useCache, resolve)
//         })
//       }
//     }
//
//     async function waitForImage(imageName: string, width: number = windowWidth.value, height: number = windowHeight.value, clear: boolean = false): Promise<string | undefined> {
//       const key = makeKey(imageName, width, height)
//       console.log('waitForImage', key, clear)
//       if (cache.value.has(key)) {
//         return Promise.resolve(cache.value.get(key) || '')
//       } else {
//         return new Promise<string>((resolve) => {
//           let req: PrefetchRequest | undefined = imagePrefetchRequests.value.find(request => request.key === key)
//           if (req === undefined) {
//             req = { key, imageName, width, height, resolvers: [] }
//             imagePrefetchRequests.value.splice(0, 0, req)
//           }
//           req.resolvers.push(resolve)
//         })
//       }
//     }
//
//     function register(key: string, blob: Blob, useCache: boolean): string {
//       const url = URL.createObjectURL(blob)
//       if (useCache) {
//         addToCache(key, url)
//         console.log('register', key, cache.value.size)
//       }
//       return url
//     }
//
//     function addToCache(imageName: string, image: string) {
//       cache.value.set(imageName, image)
//     }
//
//     return {
//
//       getImage,
//       fetchImage,
//       requestImagePrefetch
//     }
//   }
//   )
