import { readonly, ref } from 'vue'
import { Optional } from '@/utils/typeScriptUtils'

export type TouchEvent = { originalEvent: TouchEvent } & {
  touchstartX: number
  touchstartY: number
  touchmoveX: number
  touchmoveY: number
  touchendX: number
  touchendY: number
  offsetX: number
  offsetY: number
}

export type SwiperOptions = {
  key?: string,
  direction: 'horizontal' | 'vertical',
  sensitivity?: number,
  onStart?: (key?: Optional<string>) => void,
  onChange?: (delta: number, key?: Optional<string>) => void,
  onEnd?: (delta: number, key?: Optional<string>) => void,
  threshold?: number
}

export function useSwiper(options: SwiperOptions = { direction: 'horizontal' }) {
  const sensitivity = 1 / (options.sensitivity ?? 1.0)
  const swipeDelta = ref()

  const isSwiping = ref(false)
  const startSwipeCoordinate = ref(0)

  function startSwipe(startCoordinate: number) {
    isSwiping.value = true
    startSwipeCoordinate.value = startCoordinate
    swipeDelta.value = 0
    if (options.onStart) {
      options.onStart(options.key)
    }
  }

  function startMouseSwipe(event: MouseEvent) {
    startSwipe(options.direction === 'horizontal' ? event.clientX : event.clientY)
  }

  function startFingerSwipe(e: TouchEvent) {
    startSwipe(options.direction === 'horizontal' ? e.touchstartX : e.touchstartY)
  }

  function handleSwipe(newCoordinate: number) {
    if (isSwiping.value) {
      swipeDelta.value = Math.round((newCoordinate - startSwipeCoordinate.value) * sensitivity)
    }
    if (options.onChange) {
      options.onChange(swipeDelta.value, options.key)
    }
  }

  function handleMouseSwipe(event: MouseEvent) {
    handleSwipe(event.clientX)
  }

  function handleFingerSwipe(e: TouchEvent) {
    handleSwipe(e.touchmoveX)
  }

  function endSwipe() {
    isSwiping.value = false
    if (options.onEnd && options.threshold && Math.abs(swipeDelta.value) >= options.threshold) {
      options.onEnd(swipeDelta.value, options.key)
    }
    swipeDelta.value = 0
  }

  function cancelSwipe() {
    isSwiping.value = false
    swipeDelta.value = 0
  }

  function endMouseSwipe() {
    endSwipe()
  }

  function endFingerSwipe() {
    endSwipe()
  }

  return {
    isSwiping: readonly(isSwiping),
    swipeDelta: readonly(swipeDelta),
    touch: readonly({
      start: startFingerSwipe,
      move: handleFingerSwipe,
      end: endFingerSwipe
    }),

    startMouseSwipe,
    startFingerSwipe,
    handleMouseSwipe,
    handleFingerSwipe,
    endMouseSwipe,
    endFingerSwipe,
    cancelSwipe
  }
}
