import { request } from '@/utils/request'
import { SlideShowData } from '@/entities/SlideShowTypes'

export type SlideShowListItem = {
  name: string
}

export type SlideShowList = {
  path: string
  editable: boolean
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

function saveSlideShow(path: string, name: string, data: SlideShowData): Promise<string> {
  return request({
    url: '/slide-show/save',
    method: 'post',
    data: {
      path,
      name,
      data
    }
  })
}

const slideShowApiInstance = {
  requestSlideShow,
  listSlideShows,
  saveSlideShow
}

export default function useSlideShowApi() {
  return slideShowApiInstance
}
