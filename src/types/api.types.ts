import type { AxiosRequestConfig } from 'axios'

export interface ResponseData<T = unknown> {
  code: number
  message: string
  data: T
  count?: number
}

export interface RequestPoolItem {
  requestId: string
  cancel: () => void
  timestamp: number
}

export interface RequestConfig extends AxiosRequestConfig {
  useRequestPool?: boolean
  cancelDuplicate?: boolean
  _retry?: boolean
}
