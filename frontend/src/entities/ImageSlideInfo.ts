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

export type ImageSlideInfo = {
  imageName: string
  label?: LabelInfo
  trigger?: Trigger

  blockIndex?: number
  slideCountInBlock?: number
  slideInBlockIndex?: number
  absoluteIndex?: number

}

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

export type SlideShowBlock = {
  slides: ImageSlideInfo[],
  transition?: Transition
  trigger?: Trigger
  atTheEnd?: AtTheEndContinue | AtTheEndHold | AtTheEndLoop
}

export type SlideShowInfo = {
  blocks: SlideShowBlock[]
}
