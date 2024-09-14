import { GroupSlide, ImageSlide, Slide, SlideShow } from '@/entities/SlideShowTypes'
import { useEventListener } from '@vueuse/core'

export enum SlideShowState {
  PLAYING = 'playing',
  HOLD_ON_SLIDE = 'holdOnSlide',
  MANUAL_HOLD = 'manualHold',
  FINISHED = 'finished'
}

export class SlideShowRunner {
  slideShow: SlideShow
  currentSlideIndex: number = 0
  currentInGroupIndex: number = 0
  currentSlide: Slide | undefined = undefined
  currentImageSlide: ImageSlide | undefined = undefined
  onSwap: (slideInfo: ImageSlide | undefined) => void
  onStateChange: (state: SlideShowState) => void = () => {
  }

  private countdown: NodeJS.Timeout | null = null
  private state: SlideShowState = SlideShowState.PLAYING

  private visitedSlides = new Set<Slide>()

  constructor(slideShow: SlideShow,
    onSwap: (slideInfo: ImageSlide | undefined) => void,
    onStateChange: (state: SlideShowState) => void) {
    this.slideShow = slideShow
    this.onSwap = onSwap
    this.onStateChange = onStateChange
  }

  // private nextBlock() {
  //   if (this.state === SlideShowState.FINISHED) {
  //     return
  //   }
  //   this.currentBlockIndex++
  //   this.currentSlideIndex = 0
  //   if (this.currentBlockIndex >= this.info.blocks.length) {
  //     this.setState(SlideShowState.FINISHED)
  //     this.onSwap(undefined)
  //   } else {
  //     if (this.state !== SlideShowState.MANUAL_HOLD) {
  //       this.setState(SlideShowState.PLAYING)
  //     }
  //     this.show()
  //   }
  // }

  start() {
    this.updateCurrentSlide()
    this.setState(SlideShowState.PLAYING)
    this.show()

    useEventListener(window, 'keydown', (event) => {
      if (this.state === SlideShowState.HOLD_ON_SLIDE && this.currentImageSlide) {
        const trigger = this.getTrigger(this.currentImageSlide)
        if (trigger.type === 'key' && trigger.keys?.includes(event.code.toLowerCase())) {
          this.setState(SlideShowState.PLAYING)
          this.showNext()
        }
      } else if (this.state === SlideShowState.PLAYING && this.currentSlide?.type === 'group') {
        const trigger = this.getGroupTrigger(this.currentSlide)
        if (trigger.type === 'key' && trigger.keys?.includes(event.code.toLowerCase())) {
          this.showNext('force')
        }
      }
      if (event.code === 'P' || event.code === 'Pause') {
        // switch (this.state) {
        //   case SlideShowState.PLAYING:
        //     this.setState(SlideShowState.HOLD_ON_SLIDE)
        //     break
        //   case SlideShowState.HOLD_ON_BLOCK_END:
        //     this.nextBlock()
        //     break
        //   case SlideShowState.HOLD_ON_SLIDE:
        //     this.setState(SlideShowState.PLAYING)
        //     this.showNext()
        //     break
        //   case SlideShowState.MANUAL_HOLD:
        //     this.setState(SlideShowState.PLAYING)
        //     this.showNext()
        //     break
        // }
      } else if (event.code === 'ArrowRight' && this.state !== SlideShowState.FINISHED) {
        // this.setState(SlideShowState.MANUAL_HOLD)
        // this.showNext()
      } else if (event.code === 'ArrowLeft' && this.state !== SlideShowState.FINISHED) {
        // this.setState(SlideShowState.MANUAL_HOLD)
        // this.showPrev()
      } else if ((event.code === 'Enter' || event.code === 'Space') && this.state !== SlideShowState.FINISHED) {
        // this.nextBlock()
      }
      console.log('Key pressed', event.code)
    })
  }

  updateCurrentSlide() {
    let slide : Slide = this.slideShow.slides[this.currentSlideIndex]
    this.currentSlide = slide
    if (slide.type === 'group') {
      slide = slide.slides[this.currentInGroupIndex]
    }
    this.currentImageSlide = slide
    return slide
  }

  show() {
    const slide = this.currentImageSlide
    if (!slide) {
      return
    }
    this.onSwap(slide)
    const trigger = this.getTrigger(slide)
    console.log('Showing slide', slide.uid, slide.index, slide.imageName, trigger)
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

  // showPrev() {
  //   if (this.countdown !== null) {
  //     clearTimeout(this.countdown)
  //   }
  //   console.log('Prev: ', this.currentSlideIndex, ' of ', this.info.blocks[this.currentBlockIndex].slides.length, 'on block', this.currentBlockIndex)
  //   this.currentSlideIndex--
  //   if (this.currentSlideIndex < 0) {
  //     this.currentBlockIndex--
  //     if (this.currentBlockIndex < 0) {
  //       this.currentBlockIndex = 0
  //       this.currentSlideIndex = 0
  //     } else {
  //       this.currentSlideIndex = this.info.blocks[this.currentBlockIndex].slides.length - 1
  //     }
  //   }
  //   console.log('Prev (set): ', this.currentSlideIndex, ' of ', this.info.blocks[this.currentBlockIndex].slides.length, 'on block', this.currentBlockIndex)
  //   this.show()
  // }
  //
  showNext(exitGroup : 'force' | 'at-end' | undefined = undefined) {
    if (this.countdown !== null) {
      clearTimeout(this.countdown)
    }
    this.countdown = null
    const slide = this.currentSlide
    let moveOn = false
    if (slide?.type === 'group' && exitGroup !== 'force') {
      this.currentInGroupIndex++
      if (this.currentInGroupIndex >= slide.slides.length) {
        this.currentInGroupIndex = 0
        if (exitGroup === 'at-end') {
          moveOn = true
        }
      }
    }
    if (moveOn || exitGroup === 'force' || slide?.type === 'image') {
      this.currentSlideIndex++
      if (this.currentSlideIndex >= this.slideShow.slides.length) {
        this.setState(SlideShowState.FINISHED)
        this.onSwap(undefined)
        return
      }
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
