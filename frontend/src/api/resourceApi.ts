import { request } from '@/utils/request'

export type ThumbnailRequest = {
  fileName: string
  width?: number
  height?: number
}

function requestImage(fileName: string): Promise<Blob> {
  return request({
    url: '/resource/image',
    method: 'post',
    responseType: 'blob',
    data: {
      fileName
    }
  })
}

function requestThumbnail(fileName: string, width?: number, height?: number): Promise<Blob> {
  const data : ThumbnailRequest = {
    fileName
  }
  if (width) {
    data.width = width
  }
  if (height) {
    data.height = height
  }
  return request({
    url: '/resource/thumbnail',
    method: 'post',
    responseType: 'blob',
    data
  })
}

const resourceApiInstance = {
  requestImage,
  requestThumbnail
}

export default function useResourceApi() {
  return resourceApiInstance
}
