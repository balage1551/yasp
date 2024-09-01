import { request } from '@/utils/request'
import { UserHeadDTO } from '@/entities/UserHead'

export type LoginData = {
  account: string,
  password: string
}

export type LoginResult = {
  token: string
  permissions: string[]
  currentUser: UserHeadDTO
}

export type RegistrationData = {
  accountName: string,
  firstName: string,
  surname: string,
  nickname?: string,
  email?: string,
  password: string
}

export type RegistrationResult = {
  success: boolean,
  errorCode?: string
}

function login(loginData: LoginData): Promise<LoginResult> {
  return request({
    url: '/auth/login',
    method: 'post',
    data: loginData
  })
}

function register(registrationData: RegistrationData): Promise<RegistrationResult> {
  return request({
    url: '/auth/register',
    method: 'post',
    data: registrationData
  })
}

function logout() : Promise<never> {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

const authApiInstance = {
  login,
  register,
  logout
}

export default function useAuthApi() {
  return authApiInstance
}
