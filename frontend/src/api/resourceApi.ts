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

const resourceApiInstance = {
  requestImage
}

export default function useResourceApi() {
  return resourceApiInstance
}
