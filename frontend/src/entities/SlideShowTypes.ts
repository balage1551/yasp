export type OutlineStyle = {
  color?: string | undefined
  width?: number | undefined
}

export type LabelInfo = {
  text: string
  size?: string | undefined
  align?: 'left' | 'center' | 'right'
  color?: string | undefined
  top?: string | undefined
  left?: string | undefined
  anchorX?: string | undefined
  anchorY?: string | undefined
  outlined?: 'default' | OutlineStyle
  override?: boolean
}

//
// export type CrossFadeTransition = {
//   type: 'crossFade'
//   duration?: number
// }
//
// export type Transition = CrossFadeTransition

export type TimedTrigger = {
  type: 'timed'
  time?: number
}

export const POSSIBLE_KEYS = ['enter', 'space', 'tab'] as const

export type KeyTrigger = {
  type: 'key'
  keys?: string[],
  onlyOnce?: boolean
}

export type Trigger = TimedTrigger | KeyTrigger

export type ImageSlideData = {
  type?: 'image'
  imageName: string
  label?: LabelInfo
  trigger?: Trigger
}

export type GroupSlideData = {
  type: 'group'
  name?: string
  trigger?: Trigger
  slideTrigger?: Trigger
  label?: LabelInfo
  slides: ImageSlideData[]
}

export type SlideData = ImageSlideData | GroupSlideData

export type SlideBase = {
  index: number
  uid: number
}

export type GroupSlide = GroupSlideData & SlideBase & {
  // eslint-disable-next-line no-use-before-define
  slides: ImageSlide[]
}

export type ImageSlide = ImageSlideData & SlideBase & {
  group?: GroupSlide
  thumbnail?: string | undefined
  missing?: boolean
}

export type Slide = ImageSlide | GroupSlide

export const DEFAULT_TRIGGER_TIME = 3000
export const DEFAULT_TRIGGER_KEYS = ['enter', 'space']
export const DEFAULT_TRIGGER: Trigger = { type: 'key', keys: DEFAULT_TRIGGER_KEYS }
export const DEFAULT_GROUP_TRIGGER: Trigger = { type: 'key', keys: DEFAULT_TRIGGER_KEYS }
export const DEFAULT_GROUP_SLIDE_TRIGGER: Trigger = { type: 'timed', time: DEFAULT_TRIGGER_TIME }

export type SlideShowData = {
  trigger?: Trigger // Default trigger for individual images
  groupTrigger?: Trigger // Default trigger for groups exits
  groupSlideTrigger?: Trigger // Default trigger for group images
  slides: SlideData[]
}

export type SlideShow = SlideShowData & {
  slides: Slide[]
  totalSlides: number
}

export type BasketItem = {
  imageName: string
  thumbnail?: string | undefined
  usedInSlideShow: boolean
}
