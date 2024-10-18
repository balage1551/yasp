import { GroupSlide, ImageSlide, SlideShow } from '@/entities/SlideShowTypes'

export type SlideSignpost = {
  slide: ImageSlide
  next: ImageSlide | undefined
  previous: ImageSlide | undefined
  parent: GroupSlide | undefined
  nextNotInGroup: ImageSlide | undefined
  previousNotInGroup: ImageSlide | undefined
}

export class SlideShowNavigator {
  private slideShow: SlideShow
  private signposts: Map<number, SlideSignpost> = new Map()

  constructor(slideShow: SlideShow) {
    this.slideShow = slideShow
    this.buildSignposts()
    const flat = this.slideShow.slides.flatMap(slide => {
      if (slide.type === 'group') {
        return slide.slides
      } else {
        return [slide]
      }
    }) as ImageSlide[]

    // console.log('Neighbours', this.getNeighbours(flat[0], 2, 5).map(slide => slide.uid))
    // console.log('Neighbours', this.getNeighbours(flat.find(s => s.uid === 5)!, 3, 6).map(slide => slide.uid))
    // console.log('Neighbours', this.getNeighbours(flat.find(s => s.uid === 79)!, 3, 6).map(slide => slide.uid))
    //
    // console.log('Signposts', this.signposts)
    // console.table(Array.from(this.signposts.values()).map(signpost => {
    //   return {
    //     slide: signpost.slide.uid,
    //     parent: signpost.parent?.uid,
    //     next: signpost.next?.uid,
    //     nextNotInGroup: signpost.nextNotInGroup?.uid,
    //     previous: signpost.previous?.uid,
    //     previousNotInGroup: signpost.previousNotInGroup?.uid
    //   }
    // }))
  }

  private buildSignposts() {
    for (let i = 0; i < this.slideShow.slides.length; i++) {
      const slide = this.slideShow.slides[i]
      const nextSlide = this.slideShow.slides[i + 1]
      const previousSlide = this.slideShow.slides[i - 1]
      const nextImageSlide = nextSlide?.type === 'group' ? (nextSlide as GroupSlide).slides[0] : nextSlide
      const previousImageSlide = previousSlide?.type === 'group' ? (previousSlide as GroupSlide).slides[previousSlide.slides.length - 1] : previousSlide
      if (slide.type === 'image') {
        this.signposts.set(slide.uid, {
          slide,
          parent: undefined,
          next: nextImageSlide,
          previous: previousImageSlide,
          nextNotInGroup: nextImageSlide,
          previousNotInGroup: previousImageSlide
        })
      } else if (slide.type === 'group') {
        const groupLength = slide.slides.length
        for (let j = 0; j < groupLength; j++) {
          const igSlide = slide.slides[j]
          const igNextSlide = slide.slides[(j + 1) % groupLength] as ImageSlide
          const igPreviousSlide = slide.slides[(j + groupLength - 1) % groupLength] as ImageSlide
          this.signposts.set(igSlide.uid, {
            slide: igSlide,
            parent: slide,
            next: igNextSlide,
            previous: igPreviousSlide,
            nextNotInGroup: nextImageSlide,
            previousNotInGroup: previousImageSlide
          })
        }
      }
    }
  }

  public getNeighbours(slide: ImageSlide, back: number, ahead: number): ImageSlide[] {
    const result: ImageSlide[] = []
    const visited: Set<number> = new Set()

    function add(sl: ImageSlide) {
      visited.add(sl.uid)
      result.push(sl)
    }

    function isVisited(signpost: SlideSignpost | undefined) {
      if (signpost) {
        return visited.has(signpost.slide.uid)
      }
      return false
    }

    const signposts = this.signposts

    function getSignpost(slide: ImageSlide | undefined) {
      return (slide) ? signposts.get(slide.uid) : undefined
    }

    add(slide)
    const signpost = this.signposts.get(slide.uid)!
    let aheadSignpost: SlideSignpost = signpost
    let backSignpost: SlideSignpost = signpost
    for (let d = 0; d < ahead; d++) {
      let nextSignpost = getSignpost(aheadSignpost?.next)
      if (isVisited(nextSignpost)) {
        nextSignpost = getSignpost(aheadSignpost?.nextNotInGroup)
      }
      if (nextSignpost) {
        add(nextSignpost.slide)
        aheadSignpost = nextSignpost
      }
    }
    for (let d = 0; d < back; d++) {
      let previousSignpost = getSignpost(backSignpost?.previous)
      if (isVisited(previousSignpost)) {
        previousSignpost = getSignpost(backSignpost.previousNotInGroup)
      }
      if (previousSignpost) {
        add(previousSignpost.slide)
        backSignpost = previousSignpost
      }
    }

    return result
  }
}
