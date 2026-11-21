import { GroupSlide, ImageSlide, Slide, SlideShow } from '@/entities/SlideShowTypes'
import { useEventListener } from '@vueuse/core'
import { Ref, ref } from 'vue'
import { useImageCache } from '@/stores/imageCacheStore'
import { SlideShowNavigator } from '@/entities/SlideShowNavigator'

export enum SlideShowState {
  PLAYING = 'playing',
  HOLD_ON_SLIDE = 'holdOnSlide',
  MANUAL_HOLD = 'manualHold',
  FINISHED = 'finished'
}

// NOTE: SlideIndex is 1-based
type SlideIndex = {
  slideIndex: number
  inGroupIndex: number
}

const imageCacheStore = useImageCache()

export class SlideShowRunner {
  slideShow: SlideShow
  lookAhead = 5
  lookBehind = 2
  currentSlideIndex: Ref<number> = ref(0)
  currentInGroupIndex: Ref<number> = ref(0)
  currentSlide: Ref<Slide | undefined> = ref(undefined)
  currentImageSlide: ImageSlide | undefined = undefined
  onSwap: (slideInfo: ImageSlide | undefined, cacheRequest: ImageSlide[]) => void
  onStateChange: (state: SlideShowState) => void = () => {
  }

  private countdown: NodeJS.Timeout | null = null
  private state: SlideShowState = SlideShowState.PLAYING

  private visitedSlides = new Set<Slide>()
  private navigator: SlideShowNavigator

  constructor(slideShow: SlideShow,
    lookAhead: number,
    lookBehind: number,
    onSwap: (slideInfo: ImageSlide | undefined, cache: ImageSlide[]) => void,
    onStateChange: (state: SlideShowState) => void) {
    this.slideShow = slideShow
    this.navigator = new SlideShowNavigator(slideShow)
    this.onSwap = onSwap
    this.onStateChange = onStateChange
    this.lookAhead = lookAhead
    this.lookBehind = lookBehind
  }

  start() {
    this.updateCurrentSlide()
    this.setState(SlideShowState.PLAYING)
    this.show()

    useEventListener(window, 'click', (event) => {
      if (event.button === 0) {
        this.handleKey('Space')
      }
    })

    useEventListener(window, 'keydown', (event) => this.handleKey(event.code))
  }

  stop() {
    if (this.countdown !== null) {
      clearTimeout(this.countdown)
    }
    this.countdown = null
    this.setState(SlideShowState.FINISHED)
  }

  handleKey(code: string) {
    if (this.state === SlideShowState.HOLD_ON_SLIDE && this.currentImageSlide) {
      const trigger = this.getTrigger(this.currentImageSlide)
      if (trigger.type === 'key' && trigger.keys?.includes(code.toLowerCase())) {
        this.setState(SlideShowState.PLAYING)
        this.showNext()
      }
    } else if (this.state === SlideShowState.MANUAL_HOLD && code === 'Space') {
      this.setState(SlideShowState.PLAYING)
      this.showNext()
    } else if (this.state === SlideShowState.PLAYING && this.currentSlide.value?.type === 'group') {
      const trigger = this.getGroupTrigger(this.currentSlide.value)
      if (trigger.type === 'key' && trigger.keys?.includes(code.toLowerCase())) {
        this.showNext('force')
      }
    }
    if (code === 'KeyP' || code === 'Pause') {
      switch (this.state) {
        case SlideShowState.PLAYING:
        case SlideShowState.HOLD_ON_SLIDE:
          this.setState(SlideShowState.MANUAL_HOLD)
          break
        case SlideShowState.MANUAL_HOLD:
          this.setState(SlideShowState.PLAYING)
          this.showNext()
          break
      }
    } else if (code === 'ArrowRight' && this.state !== SlideShowState.FINISHED) {
      this.setState(SlideShowState.MANUAL_HOLD)
      this.showNext('at-end')
    } else if (code === 'ArrowLeft' && this.state !== SlideShowState.FINISHED) {
      this.setState(SlideShowState.MANUAL_HOLD)
      this.showPrev()
    } else if ((code === 'Enter' || code === 'Space') && this.state !== SlideShowState.FINISHED) {
      // this.nextBlock()
    }
    console.log('Key pressed', code)
  }

  /** Continues a held playback (manually or waiting for a key), whatever its trigger keys are. */
  resume() {
    if (this.state === SlideShowState.MANUAL_HOLD || this.state === SlideShowState.HOLD_ON_SLIDE) {
      this.setState(SlideShowState.PLAYING)
      this.showNext()
    }
  }

  updateCurrentSlide() {
    let slide: Slide = this.slideShow.slides[this.currentSlideIndex.value]
    this.currentSlide.value = slide
    if (slide.type === 'group') {
      slide = slide.slides[this.currentInGroupIndex.value]
    }
    this.currentImageSlide = slide
    return slide
  }

  updateCurrentSlide2(slides: SlideIndex) {
    this.currentSlideIndex.value = slides.slideIndex - 1
    this.currentInGroupIndex.value = slides.inGroupIndex - 1
    return this.updateCurrentSlide()
  }

  show() {
    const slide = this.currentImageSlide
    if (!slide) {
      return
    }
    const trigger = this.getTrigger(slide)
    console.warn('Showing slide', slide.uid, slide.index, slide.imageName, trigger)
    this.onSwap(slide, this.navigator.getNeighbours(slide, this.lookBehind, this.lookAhead))
    // if (trigger && trigger.type === 'key' && trigger.onlyOnce && this.visitedSlides.has(slide)) {
    //   trigger = undefined
    // }
    if (trigger.type === 'timed' && this.state !== SlideShowState.MANUAL_HOLD) {
      this.countdown = setTimeout(() => this.showNext(), (trigger.time ?? 5000))
    }
    if (trigger.type === 'key' && this.state !== SlideShowState.MANUAL_HOLD) {
      this.setState(SlideShowState.HOLD_ON_SLIDE)
    }
    this.visitedSlides.add(slide)
  }

  private getTrigger(slide: ImageSlide) {
    let trigger = slide.trigger
    if (!trigger) {
      if (slide.group) {
        trigger = slide.group.slideTrigger ?? this.slideShow.groupSlideTrigger ?? {
          type: 'timed',
          time: 3000
        }
      } else {
        trigger = this.slideShow.trigger ?? { type: 'key', keys: ['space'] }
      }
    }
    return trigger
  }

  private getGroupTrigger(slide: GroupSlide) {
    return slide.trigger ?? this.slideShow.groupTrigger ?? { type: 'key', keys: ['space'] }
  }

  showPrev() {
    if (this.countdown !== null) {
      clearTimeout(this.countdown)
    }
    this.countdown = null
    const slide = this.currentSlide.value
    let moveOn = false
    if (slide?.type === 'group') {
      this.currentInGroupIndex.value--
      if (this.currentInGroupIndex.value < 0) {
        this.currentInGroupIndex.value = 0
        moveOn = true
      }
    }
    if (moveOn || slide?.type === 'image') {
      if (this.currentSlideIndex.value > 0) {
        this.currentSlideIndex.value--
        if (this.slideShow.slides[this.currentSlideIndex.value].type === 'group') {
          this.currentInGroupIndex.value = (this.slideShow.slides[this.currentSlideIndex.value] as GroupSlide).slides.length - 1
        }
      } else if (!moveOn) {
        return
      }
    }
    console.log('Showing prev', this.currentSlideIndex.value, this.currentInGroupIndex.value)
    this.updateCurrentSlide()
    this.show()
  }

  toSlide(index: SlideIndex | undefined): ImageSlide | undefined {
    if (index === undefined) {
      return undefined
    }
    let slide = this.slideShow.slides[index.slideIndex - 1]
    if (slide.type === 'group') {
      slide = (slide as GroupSlide).slides[index.inGroupIndex! - 1]
    }
    return slide
  }

  toSlideIndex(slide: Slide | undefined): SlideIndex | undefined {
    if (slide === undefined) {
      return undefined
    } else {
      if (slide.type === 'image' && slide.group !== undefined) {
        return { slideIndex: slide.group.index, inGroupIndex: slide.index }
      } else {
        return { slideIndex: slide.index, inGroupIndex: 0 }
      }
    }
  }

  calculateNextSlide(origin: SlideIndex | undefined, exitGroup: 'force' | 'at-end' | undefined = undefined): SlideIndex | undefined {
    let moveOn = false
    let currentSlideIndex: number | undefined = origin?.slideIndex || 0
    let currentInGroupIndex: number | undefined = origin?.inGroupIndex || 0
    const slide = this.toSlide(origin)
    if (!slide) {
      return this.toSlideIndex(slide)
    }

    if (slide.group && exitGroup !== 'force') {
      currentInGroupIndex++
      if (currentInGroupIndex > slide.group.slides.length) {
        currentInGroupIndex = 1
        if (exitGroup === 'at-end') {
          moveOn = true
        }
      }
    }
    if (moveOn || exitGroup === 'force' || slide.group === undefined) {
      currentSlideIndex++
      currentInGroupIndex = 0
      if (currentSlideIndex > this.slideShow.slides.length) {
        return undefined
      }
      if (this.slideShow.slides[currentSlideIndex - 1].type === 'group') {
        currentInGroupIndex = 1
      }
    }
    const result = { slideIndex: currentSlideIndex, inGroupIndex: currentInGroupIndex }
    console.log('calculate next of ', origin, 'is', result)
    return result
  }

  showNext(exitGroup: 'force' | 'at-end' | undefined = undefined) {
    if (this.countdown !== null) {
      clearTimeout(this.countdown)
    }
    this.countdown = null
    const next = this.calculateNextSlide(this.toSlideIndex(this.currentImageSlide), exitGroup)
    console.log('Showing next', next)
    // const lookAhead = this.getLookAheadSlides(next)
    if (next === undefined) {
      this.setState(SlideShowState.FINISHED)
      this.onSwap(undefined, [])
      return
    } else {
      this.updateCurrentSlide2(next)
    }
    this.show()
  }

  jumpToSlide(slide: ImageSlide) {
    if (this.countdown !== null) {
      clearTimeout(this.countdown)
    }
    if (slide.group) {
      this.currentSlideIndex.value = this.slideShow.slides.findIndex(s => s === slide.group)
      this.currentInGroupIndex.value = slide.group.slides.findIndex(s => s === slide)
    } else {
      this.currentSlideIndex.value = this.slideShow.slides.findIndex(s => s === slide)
      this.currentInGroupIndex.value = 0
    }
    this.updateCurrentSlide()
    this.show()
  }

  private setState(state: SlideShowState) {
    if (this.countdown && state !== SlideShowState.PLAYING) {
      clearTimeout(this.countdown)
    }
    this.state = state
    this.onStateChange(state)
  }
}
