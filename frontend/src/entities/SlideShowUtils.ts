import { ImageSlideData, LabelInfo, OutlineStyle, Slide, SlideShowBlock, SlideShowBlockData, SlideShowData, SlideShowInfo } from '@/entities/SlideShowTypes'
import { toNumber } from 'lodash'

let uidCounter = 0

export function nextUID() {
  return uidCounter++
}

export function processSlideShowData(data: SlideShowData) : SlideShowInfo {
  const info : SlideShowInfo = { blocks: [], totalSlides: 0 }
  for (let bi = 0; bi < data.blocks.length; bi++) {
    const blockData = data.blocks[bi]
    const block: SlideShowBlock = {
      slides: [],
      transition: blockData.transition,
      trigger: blockData.trigger,
      atTheEnd: blockData.atTheEnd,
      name: blockData.name,
      index: bi + 1,
      uid: nextUID()
    }
    info.blocks.push(block)

    for (let sibi = 0; sibi < blockData.slides.length; sibi++) {
      const slide = blockData.slides[sibi]
      const slideInfo : Slide = {
        imageName: slide.imageName,
        label: slide.label,
        trigger: slide.trigger,
        blockIndex: bi + 1,
        inBlockIndex: sibi + 1,
        block,
        absoluteIndex: (++info.totalSlides)
      }
      block.slides.push(slideInfo)
    }
  }

  return info
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

export function toData(slideShow: SlideShowInfo) : SlideShowData {
  const data: SlideShowData = {
    blocks: []
  }
  slideShow.blocks.forEach(block => {
    const blockData : SlideShowBlockData = {
      name: block.name ?? '',
      slides: []
    }
    if (block.transition) {
      blockData.transition = block.transition
    }
    if (block.trigger) {
      blockData.trigger = block.trigger
    }
    if (block.atTheEnd) {
      blockData.atTheEnd = block.atTheEnd
    }
    block.slides.forEach(slide => {
      const slideData : ImageSlideData = {
        imageName: slide.imageName
      }
      if (slide.label) {
        slideData.label = slide.label
      }
      if (slide.trigger) {
        slideData.trigger = slide.trigger
      }
      blockData.slides.push(slideData)
    })
    data.blocks.push(blockData)
  })
  return data
}
