import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/config/api.config'
import { authApi } from '@/api/auth.api'

export const tokenManager = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (refreshToken: string): void => localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken),
  
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
  
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(TOKEN_KEY)
    return !!token
  },
  
  refreshToken: async (): Promise<string> => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!refreshToken) {
      throw new Error('没有refresh token')
    }
    
    const result = await authApi.refresh(refreshToken)
    localStorage.setItem(TOKEN_KEY, result.access)
    
    if (result.refresh) {
      localStorage.setItem(REFRESH_TOKEN_KEY, result.refresh)
    }
    
    return result.access
  },
}
