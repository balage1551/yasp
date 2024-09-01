import { request } from '@/utils/request'
import { SlideShowData } from '@/entities/SlideShowTypes'

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
  requestSlideShow
}

export default function useSlideShowApi() {
  return slideShowApiInstance
}
