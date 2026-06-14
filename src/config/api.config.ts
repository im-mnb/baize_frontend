type ApiConfig = {
  baseURL: string
  timeout: number
}

const env = import.meta.env.VITE_APP_ENV || 'development'

const configMap: Record<string, ApiConfig> = {
  development: {
    baseURL: 'http://127.0.0.1:8000',
    timeout: 10000,
  },
  production: {
    baseURL: 'http://127.0.0.1:8000',
    timeout: 10000,
  },
  test: {
    baseURL: 'http://127.0.0.1:8000',
    timeout: 10000,
  },
}

export const API_CONFIG: ApiConfig = configMap[env]!

export const TOKEN_KEY = 'token'
export const REFRESH_TOKEN_KEY = 'refreshToken'
