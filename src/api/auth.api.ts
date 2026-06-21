import { request } from '@/utils/request'
import { API_URL } from '@/config/api.url'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResponse {
  refresh: string
  access: string
}

export interface RefreshResponse {
  refresh?: string
  access: string
}

export const authApi = {
  login: (params: LoginParams) => {
    return request.post<LoginResponse>(API_URL.auth.login, params, {
      useRequestPool: true,
      cancelDuplicate: true,
    })
  },

  refresh: (refreshToken: string) => {
    return request.post<RefreshResponse>(
      API_URL.auth.refresh,
      { refresh: refreshToken },
      {
        useRequestPool: true,
        cancelDuplicate: true,
      }
    )
  },
}
