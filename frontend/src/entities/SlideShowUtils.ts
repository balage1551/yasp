import { GroupSlide, GroupSlideData, ImageSlide, ImageSlideData, LabelInfo, OutlineStyle, Slide, SlideShow, SlideShowData, } from '@/entities/SlideShowTypes'
import { toNumber } from 'lodash'

let uidCounter = 0

export function nextUID() {
  return uidCounter++
}

export function processSlideShowData(data: SlideShowData) : SlideShow {
  function mapImageSlideData(slideData: ImageSlideData, index: number, group: GroupSlide | undefined = undefined) : ImageSlide {
    return {
      ...slideData,
      type: 'image',
      index,
      uid: nextUID(),
      group,
      missing: false
    }
  }

  const slideShow : SlideShow = { slides: [] }
  if (data.trigger) {
    slideShow.trigger = data.trigger
  }
  if (data.groupTrigger) {
    slideShow.groupTrigger = data.groupTrigger
  }
  if (data.groupSlideTrigger) {
    slideShow.groupSlideTrigger = data.groupSlideTrigger
  }
  for (let si = 0; si < data.slides.length; si++) {
    const slideData = data.slides[si]
    if (slideData.type === 'group') {
      const slide : GroupSlide = {
        uid: nextUID(),
        index: si + 1,
        type: 'group',
        name: slideData.name,
        trigger: slideData.trigger,
        slideTrigger: slideData.slideTrigger,
        label: slideData.label,
        slides: new Array<ImageSlide>()
      }
      for (let i = 0; i < slideData.slides.length; i++) {
        const slideInfo = slideData.slides[i]
        const imageSlide = mapImageSlideData(slideInfo, i + 1, slide)
        slide.slides.push(imageSlide)
      }
      slideShow.slides.push(slide)
    } else {
      slideShow.slides.push(mapImageSlideData(slideData, si + 1))
    }
  }

  return slideShow
}

export function labelStyles(l: LabelInfo | undefined, labelDefaults: LabelInfo, scale: number = 100) : string {
  function scaleValue(v: string | number, trim: number = 0) {
    if (typeof v === 'number') {
      return v * scale / 100
    } else {
      return toNumber(v.substring(0, v.length - trim)) * scale / 100
    }
  }
  // console.log('labelStyle', l)
  if (!l) {
    return ''
  }
  let styles = ''
  const size = l.size ?? labelDefaults.size
  if (size) {
    if (size.endsWith('%')) {
      styles += `font-size: ${scaleValue(size, 1)}vw;`
    } else {
      styles += `font-size: ${size}pt;`
    }
  }

  const color = l.color ?? labelDefaults.color
  if (color) {
    styles += `color: ${color};`
  }

  const top = l.top ?? labelDefaults.top
  if (top) {
    if (top.endsWith('%')) {
      styles += `margin-top: ${scaleValue(top, 1)}vh;`
    } else {
      styles += `margin-top: ${scaleValue(top)}px;`
    }
  }

  const left = l.left ?? labelDefaults.left
  if (left) {
    if (left.endsWith('%')) {
      styles += `margin-left: ${scaleValue(left, 1)}vw;`
    } else {
      styles += `margin-left: ${scaleValue(left)}px;`
    }
  }

  const outlined : OutlineStyle | undefined = (l.outlined === 'default') ? labelDefaults.outlined as OutlineStyle : l.outlined
  if (outlined) {
    const w = scaleValue(outlined.width ?? 1)
    const c = outlined.color ?? '#000000'
    styles += `text-shadow: -${w}px -${w}px 0 ${c}, ${w}px -${w}px 0 ${c},
    -${w}px ${w}px 0 ${c}, ${w}px ${w}px 0 ${c};`
  }

  return styles
}

export function toData(slideShow: SlideShow) : SlideShowData {
  function mapImageSlide(slide: ImageSlide) : ImageSlideData {
    const data: ImageSlideData = {
      type: 'image',
      imageName: slide.imageName
    }
    if (slide.label) {
      data.label = slide.label
    }
    if (slide.trigger) {
      data.trigger = slide.trigger
    }
    return data
  }

  const data: SlideShowData = {
    slides: []
  }
  if (slideShow.trigger) {
    data.trigger = slideShow.trigger
  }
  if (slideShow.groupTrigger) {
    data.groupTrigger = slideShow.groupTrigger
  }
  if (slideShow.groupSlideTrigger) {
    data.groupSlideTrigger = slideShow.groupSlideTrigger
  }
  slideShow.slides.forEach((slide : Slide) => {
    if (slide.type === 'group') {
      const groupData : GroupSlideData = {
        type: 'group',
        slides: []
      }
      if (slide.name) {
        groupData.name = slide.name
      }
      if (slide.trigger) {
        groupData.trigger = slide.trigger
      }
      if (slide.slideTrigger) {
        groupData.slideTrigger = slide.slideTrigger
      }
      if (slide.label) {
        groupData.label = slide.label
      }
      (slide as GroupSlide).slides.forEach((inGroupSlide : ImageSlide) => {
        groupData.slides.push(mapImageSlide(inGroupSlide))
      })
      data.slides.push(groupData)
    } else {
      data.slides.push(mapImageSlide(slide))
    }
  })
  return data
}

export function getAllImageSlides(slideShow: SlideShow) : ImageSlide[] {
  return slideShow.slides.flatMap(slide => {
    if (slide.type === 'group') {
      return (slide as GroupSlide).slides
    } else {
      return [slide as ImageSlide]
    }
  })
}

export function fullIndex(slide: Slide | undefined) {
  if (!slide) {
    return ''
  }
  return ((slide.type === 'image' && slide.group) ? slide.group.index + '.' : '') + slide.index
}
