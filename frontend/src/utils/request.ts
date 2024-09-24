import axios, { AxiosResponse } from 'axios'
import { useTokenStore } from '@/stores/tokenStore'
import { useSnackbarStore } from '@/modules/snackbar/snackbarStore'
import router from '@/router'

export const baseUrl = getBaseUrl()

function getBaseUrl() : string {
  if (import.meta.env.DEV) {
    console.log('Development mode: ' + import.meta.env.VITE_APP_API_BASE_URL)
    return import.meta.env.VITE_APP_API_BASE_URL
  } else {
    const url = window.location.href
    const path = window.location.pathname
    console.log('Production mode: ' + url.substring(0, url.indexOf(path)))
    return url.substring(0, url.indexOf(path))
  }
}

// console.log('Base url: ', import.meta.env.DEV, import.meta.env.PROD, import.meta.env.MODE, import.meta.env.VITE_APP_API_BASE_URL, baseUrl)

// create an axios instance
export const request = axios.create({
  baseURL: baseUrl, // api base_url
  timeout: 600000, // request timeout
  withCredentials: true,
  withXSRFToken: true
})

const snackbarStore = useSnackbarStore()
const tokenStore = useTokenStore()

let loginRetryCounter = 0

request.interceptors.request.use(
  config => {
    const token = tokenStore.token
    const url = config.url ?? ''

    // console.log(url, token)

    if (token && !url.includes('public') && !url.includes('login')) {
      config.headers.Authorization = 'Bearer ' + token
    }

    return config
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

// response interceptor
request.interceptors.response.use(
  (response : AxiosResponse) => {
    // console.log('RESP', response)
    loginRetryCounter = 0
    const res = response
    if (res.status !== 200 && res.status !== 201 && res.status !== 202) {
      const errorResponse = res as unknown as { message: string }
      snackbarStore.addError(errorResponse.message)
      return Promise.reject(new Error(errorResponse.message || 'Error'))
    } else {
      return res.data
    }
  },
  error => {
    if (error.config.url === '/auth/login' && !error.config.headers['X-XSRF-TOKEN'] && loginRetryCounter < 2) {
      loginRetryCounter++
      return request.request(error.config)
    }
    loginRetryCounter = 0
    console.log('Response error caught in interceptor: ' + error)

    if (error.config.url !== '/auth/login' && error.config.url !== '/auth/registration') {
      if (error.response && error.response.status === 401) {
        // noinspection JSIgnoredPromiseFromCall
        tokenStore.resetToken()
        snackbarStore.resetMessages()
        // noinspection JSIgnoredPromiseFromCall
        router.push({ name: 'Login' })
      } else if (error.response && error.response.status === 422) {
        snackbarStore.addError(error.response.day)
      } else {
        const url = error.config.url
        let errorMessageCode = 'common.commonError'
        if (url.includes('list')) {
          errorMessageCode = 'common.listLoadingError'
        } else if (url.includes('get')) {
          errorMessageCode = 'common.loadingError'
        } else if (url.includes('save') || url.includes('create') || url.includes('update')) {
          errorMessageCode = 'common.saveError'
        } else if (url.includes('delete')) {
          errorMessageCode = 'common.deleteError'
        }
        // if (!url.includes('thumbnail')) {
        //   snackbarStore.addError('@' + errorMessageCode)
        // }
      }
    }

    return Promise.reject(error)
  }
)
