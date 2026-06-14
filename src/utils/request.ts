import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import type { RequestConfig, ResponseData, RequestPoolItem } from '@/types/api.types'
import { API_CONFIG, TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/config/api.config'

class RequestPool {
  private pool: Map<string, RequestPoolItem> = new Map()

  generateRequestId(config: InternalAxiosRequestConfig): string {
    const method = config.method?.toUpperCase() || 'GET'
    const url = config.url || ''
    const params = JSON.stringify(config.params || {})
    const data = JSON.stringify(config.data || {})
    return `${method}-${url}-${params}-${data}`
  }

  add(requestId: string, cancel: () => void): void {
    this.pool.set(requestId, {
      requestId,
      cancel,
      timestamp: Date.now(),
    })
  }

  remove(requestId: string): void {
    this.pool.delete(requestId)
  }

  cancel(requestId: string): void {
    const item = this.pool.get(requestId)
    if (item) {
      item.cancel()
      this.pool.delete(requestId)
    }
  }

  has(requestId: string): boolean {
    return this.pool.has(requestId)
  }

  clear(): void {
    this.pool.forEach((item) => item.cancel())
    this.pool.clear()
  }

  size(): number {
    return this.pool.size
  }
}

const requestPool = new RequestPool()

const httpRequest: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
})

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback)
}

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

httpRequest.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const requestConfig = config as RequestConfig

    if (requestConfig.useRequestPool !== false) {
      const requestId = requestPool.generateRequestId(config)

      if (requestConfig.cancelDuplicate && requestPool.has(requestId)) {
        requestPool.cancel(requestId)
      }

      const CancelToken = axios.CancelToken
      const source = CancelToken.source()
      config.cancelToken = source.token

      requestPool.add(requestId, source.cancel)
    }

    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

httpRequest.interceptors.response.use(
  (response: AxiosResponse) => {
    const requestConfig = response.config as RequestConfig

    if (requestConfig.useRequestPool !== false) {
      const requestId = requestPool.generateRequestId(response.config)
      requestPool.remove(requestId)
    }

    const data = response.data

    if ('code' in data) {
      const responseData = data as ResponseData
      if (responseData.code !== 200) {
        return Promise.reject(new Error(responseData.message || '请求失败'))
      }
      return responseData.data
    }

    return response.data
  },
  async (error) => {
    const requestConfig = error.config as RequestConfig

    if (requestConfig?.useRequestPool !== false) {
      const requestId = requestPool.generateRequestId(requestConfig as InternalAxiosRequestConfig)
      requestPool.remove(requestId)
    }

    if (axios.isCancel(error)) {
      return Promise.reject(new Error('请求已取消'))
    }

    if (error.response?.status === 401 && !requestConfig?._retry) {
      requestConfig._retry = true

      if (!isRefreshing) {
        isRefreshing = true
        try {
          const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
          if (!refreshToken) {
            throw new Error('没有refresh token')
          }

          const response = await axios.post(`${API_CONFIG.baseURL}/api/v1/user/token/refresh/`, {
            refresh: refreshToken,
          })

          const { access } = response.data
          localStorage.setItem(TOKEN_KEY, access)

          onTokenRefreshed(access)
          isRefreshing = false

          if (!requestConfig.headers) {
            requestConfig.headers = {}
          }
          requestConfig.headers.Authorization = `Bearer ${access}`
          return httpRequest(requestConfig)
        } catch (refreshError) {
          isRefreshing = false
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(REFRESH_TOKEN_KEY)
          window.location.href = '/'
          return Promise.reject(refreshError)
        }
      }

      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          if (!requestConfig.headers) {
            requestConfig.headers = {}
          }
          requestConfig.headers.Authorization = `Bearer ${token}`
          resolve(httpRequest(requestConfig))
        })
      })
    }

    return Promise.reject(error)
  }
)

export const request = {
  get: <T = unknown>(url: string, config?: RequestConfig): Promise<T> => {
    return httpRequest.get(url, config)
  },
  post: <T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> => {
    return httpRequest.post(url, data, config)
  },
  put: <T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> => {
    return httpRequest.put(url, data, config)
  },
  delete: <T = unknown>(url: string, config?: RequestConfig): Promise<T> => {
    return httpRequest.delete(url, config)
  },
  patch: <T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> => {
    return httpRequest.patch(url, data, config)
  },
  pool: requestPool,
}

export default httpRequest
