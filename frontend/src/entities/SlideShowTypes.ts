export type LabelInfo = {
  text: string
  size?: string | undefined
  color?: string | undefined
  top?: string | undefined
  left?: string | undefined
  outlined?: {
    color?: string | undefined
    width?: number | undefined
  }
}

export type CrossFadeTransition = {
  type: 'crossFade'
  duration?: number
}

export type Transition = CrossFadeTransition

export type TimedTrigger = {
  type: 'timed'
  seconds?: number
}

export type KeyTrigger = {
  type: 'key'
  key?: string,
  onlyOnce?: boolean
}

export type Trigger = TimedTrigger | KeyTrigger

export type AtTheEndContinue = {
  type: 'continue'
}

export type AtTheEndHold = {
  type: 'hold'
  key?: string
}

export type AtTheEndLoop = {
  type: 'loop'
  startAt?: number | string
}

export type ImageSlideData = {
  imageName: string
  label?: LabelInfo
  trigger?: Trigger
}

export type Slide = ImageSlideData & {
  blockIndex?: number
  inBlockIndex?: number
  absoluteIndex?: number
  // eslint-disable-next-line no-use-before-define
  block: SlideShowBlock
  thumbnail?: URL | undefined
}

export type SlideShowBlockBase = {
  transition?: Transition
  trigger?: Trigger
  atTheEnd?: AtTheEndContinue | AtTheEndHold | AtTheEndLoop,
  name?: string
}

export type SlideShowBlockData = SlideShowBlockBase & {
  slides: ImageSlideData[]
}

export type SlideShowBlock = SlideShowBlockBase & {
  slides: Slide[]
  index: number
  uid: number
}

export type SlideShowData = {
  blocks: SlideShowBlockData[]
}

export type SlideShowInfo = {
  blocks: SlideShowBlock[]
  totalSlides: number
}
