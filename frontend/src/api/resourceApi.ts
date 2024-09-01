import { request } from '@/utils/request'

function requestTestImage(id: number): Promise<Blob> {
  return request({
    url: '/resource/test/image/' + id,
    method: 'get',
    responseType: 'blob'
  })
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

const resourceApiInstance = {
  requestTestImage,

  requestImage
}

export default function useResourceApi() {
  return resourceApiInstance
}
