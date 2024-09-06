import { ImageSlideData, Slide, SlideShowBlock, SlideShowBlockData, SlideShowData, SlideShowInfo } from '@/entities/SlideShowTypes'

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
