import { request } from '@/utils/request'
import { UserHeadDTO } from '@/entities/UserHead'
import { Optional } from '@/utils/typeScriptUtils'

export type UpdateBaseDataRequest = {
  id: number,
  firstName: string,
  surname: string,
  nickname?: Optional<string>,
  email?: Optional<string>
}

type UpdatePasswordRequest = {
  userId: number,
  password: string
}

type UpdateUserSeminarListRequest = {
  userId: number,
  seminarIds: number[]
}

type UpdateHomeworkStateRequest = {
  userId: number,
  homeworkId: number,
  newState: string
}

function updateBaseData(baseData: UpdateBaseDataRequest): Promise<UserHeadDTO> {
  return request({
    url: '/user/preferences/base-data',
    method: 'post',
    data: baseData
  })
}

function updatePassword(userId: number, password: string): Promise<never> {
  const data : UpdatePasswordRequest = {
    userId,
    password
  }
  return request({
    url: '/user/preferences/password',
    method: 'post',
    data
  })
}

const userApiInstance = {
  updateBaseData,
  updatePassword,
}

export default function useUserApi() {
  return userApiInstance
}
