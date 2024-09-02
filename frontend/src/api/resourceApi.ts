import { request } from '@/utils/request'

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

function requestThumbnail(fileName: string): Promise<Blob> {
  return request({
    url: '/resource/thumbnail',
    method: 'post',
    responseType: 'blob',
    data: {
      fileName
    }
  })
}

const resourceApiInstance = {
  requestImage,
  requestThumbnail
}

export default function useResourceApi() {
  return resourceApiInstance
}
