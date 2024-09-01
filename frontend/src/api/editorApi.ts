import { request } from '@/utils/request'

export type FileInfo = {
  fileName: string
}

export type ScanResponse = {
  successful: boolean
  images?: FileInfo[]
}

function scanDirectory(path: string): Promise<ScanResponse> {
  return request({
    url: '/editor/scan',
    method: 'post',
    data: {
      path
    }
  })
}

const editorApiInstance = {
  scanDirectory
}

export default function useEditorApi() {
  return editorApiInstance
}
