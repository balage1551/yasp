import { Slide, SlideShowInfo, Trigger } from '@/entities/SlideShowTypes'
import { useEventListener } from '@vueuse/core'

export enum SlideShowState {
  PLAYING = 'playing',
  HOLD_ON_BLOCK_END = 'holdOnBlockEnd',
  HOLD_ON_SLIDE = 'holdOnSlide',
  MANUAL_HOLD = 'manualHold',
  FINISHED = 'finished'
}

export class SlideShow {
  info: SlideShowInfo
  currentBlockIndex: number = 0
  currentSlideIndex: number = 0
  onSwap: (slideInfo: Slide | undefined) => void
  onStateChange: (state: SlideShowState) => void = () => {}
  private defaultTrigger: Trigger = { type: 'timed', seconds: 5 }
  private countdown: NodeJS.Timeout | null = null
  private state: SlideShowState = SlideShowState.PLAYING

  private visitedSlides = new Set<Slide>()

  constructor(info: SlideShowInfo,
    onSwap: (slideInfo: Slide | undefined) => void,
    onStateChange: (state: SlideShowState) => void) {
    this.info = info
    this.onSwap = onSwap
    this.onStateChange = onStateChange
  }

  private nextBlock() {
    if (this.state === SlideShowState.FINISHED) {
      return
    }
    this.currentBlockIndex++
    this.currentSlideIndex = 0
    if (this.currentBlockIndex >= this.info.blocks.length) {
      this.setState(SlideShowState.FINISHED)
      this.onSwap(undefined)
    } else {
      if (this.state !== SlideShowState.MANUAL_HOLD) {
        this.setState(SlideShowState.PLAYING)
      }
      this.show()
    }
  }

  start() {
    this.show()
    this.setState(SlideShowState.PLAYING)

    useEventListener(window, 'keydown', (event) => {
      if (event.code === 'Space') {
        switch (this.state) {
          case SlideShowState.PLAYING:
            this.setState(SlideShowState.HOLD_ON_SLIDE)
            break
          case SlideShowState.HOLD_ON_BLOCK_END:
            this.nextBlock()
            break
          case SlideShowState.HOLD_ON_SLIDE:
            this.setState(SlideShowState.PLAYING)
            this.showNext()
            break
          case SlideShowState.MANUAL_HOLD:
            this.setState(SlideShowState.PLAYING)
            this.showNext()
            break
        }
      } else if (event.code === 'ArrowRight' && this.state !== SlideShowState.FINISHED) {
        this.setState(SlideShowState.MANUAL_HOLD)
        this.showNext()
      } else if (event.code === 'ArrowLeft' && this.state !== SlideShowState.FINISHED) {
        this.setState(SlideShowState.MANUAL_HOLD)
        this.showPrev()
      } else if ((event.code === 'Enter' || event.code === 'Tab') && this.state !== SlideShowState.FINISHED) {
        this.nextBlock()
      }
      console.log('Key pressed', event.code)
    })
  }

  show() {
    const block = this.info.blocks[this.currentBlockIndex]
    const slide = block.slides[this.currentSlideIndex]
    console.log('Showing slide', this.currentBlockIndex, this.currentSlideIndex, slide.imageName)
    this.onSwap(slide)
    let trigger = slide.trigger
    if (trigger && trigger.type === 'key' && trigger.onlyOnce && this.visitedSlides.has(slide)) {
      trigger = undefined
    }
    if (!trigger) {
      trigger = block.trigger ?? this.defaultTrigger
    }
    if (trigger.type === 'timed' && this.state !== SlideShowState.MANUAL_HOLD) {
      this.countdown = setTimeout(() => this.showNext(), (trigger.seconds ?? 5) * 1000)
    }
    if (trigger.type === 'key' && this.state !== SlideShowState.MANUAL_HOLD && slide.trigger) {
      this.setState(SlideShowState.HOLD_ON_SLIDE)
    }
    this.visitedSlides.add(slide)
  }

  showPrev() {
    if (this.countdown !== null) {
      clearTimeout(this.countdown)
    }
    console.log('Prev: ', this.currentSlideIndex, ' of ', this.info.blocks[this.currentBlockIndex].slides.length, 'on block', this.currentBlockIndex)
    this.currentSlideIndex--
    if (this.currentSlideIndex < 0) {
      this.currentBlockIndex--
      if (this.currentBlockIndex < 0) {
        this.currentBlockIndex = 0
        this.currentSlideIndex = 0
      } else {
        this.currentSlideIndex = this.info.blocks[this.currentBlockIndex].slides.length - 1
      }
    }
    console.log('Prev (set): ', this.currentSlideIndex, ' of ', this.info.blocks[this.currentBlockIndex].slides.length, 'on block', this.currentBlockIndex)
    this.show()
  }

  showNext() {
    this.countdown = null
    const block = this.info.blocks[this.currentBlockIndex]
    this.currentSlideIndex++
    console.log('Next: ', this.currentSlideIndex, ' of ', block.slides.length, 'on block', this.currentBlockIndex)
    if (this.currentSlideIndex >= block.slides.length) {
      let atTheEnd = block.atTheEnd ?? { type: 'continue' }
      if (this.state === SlideShowState.MANUAL_HOLD) {
        atTheEnd = { type: 'continue' }
      }
      console.log('Block end', atTheEnd)
      switch (atTheEnd.type) {
        case 'continue':
          this.nextBlock()
          break
        case 'hold':
          this.setState(SlideShowState.HOLD_ON_BLOCK_END)
          break
        case 'loop': {
          const start = atTheEnd.startAt ?? 0
          if (typeof start === 'number') {
            if (start >= 0) {
              this.currentSlideIndex = start
            } else {
              this.currentSlideIndex = Math.max(0, block.slides.length - start)
            }
            this.show()
            break
          } else {
            const slide = block.slides.find((slide, index) => slide.imageName === atTheEnd.startAt)
            if (slide) {
              this.currentSlideIndex = block.slides.indexOf(slide)
            }
            this.show()
          }
          break
        }
      }
    } else {
      this.show()
    }
  }

  private setState(state: SlideShowState) {
    if (this.countdown && state !== SlideShowState.PLAYING) {
      clearTimeout(this.countdown)
    }
    this.state = state
    this.onStateChange(state)
  }
}
