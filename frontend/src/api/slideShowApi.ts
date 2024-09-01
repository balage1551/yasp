import { request } from '@/utils/request'
import { SlideShowData } from '@/entities/SlideShowTypes'

export type SlideShowListItem = {
  name: string
}

export type SlideShowList = {
  path: string
  slideShows: SlideShowListItem[]
}

function listSlideShows(): Promise<SlideShowList> {
  return request({
    url: '/slide-show/list',
    method: 'get',
  })
}

function requestSlideShow(path: string, name: string): Promise<SlideShowData> {
  return request({
    url: '/slide-show/load',
    method: 'post',
    data: {
      path,
      name
    }
  })
}

const slideShowApiInstance = {
  requestSlideShow,
  listSlideShows
}

export default function useSlideShowApi() {
  return slideShowApiInstance
}
