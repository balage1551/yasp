import { Slide, SlideShowBlock, SlideShowData, SlideShowInfo } from '@/entities/SlideShowTypes'

export function processSlideShowData(data: SlideShowData) : SlideShowInfo {
  const info : SlideShowInfo = { blocks: [], totalSlides: 0 }
  for (let bi = 0; bi < data.blocks.length; bi++) {
    const blockData = data.blocks[bi]
    const block: SlideShowBlock = {
      slides: [],
      transition: blockData.transition,
      trigger: blockData.trigger,
      atTheEnd: blockData.atTheEnd,
      index: bi + 1
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
