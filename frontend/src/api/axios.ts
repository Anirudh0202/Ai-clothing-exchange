import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { AUTH_ENDPOINTS } from './endpoints'
import { clearAuthState, getAuthState, isAuthExpired, setAuthState, AuthState } from '../auth/authStorage'

const baseURL = import.meta.env.VITE_API_BASE_URL || undefined

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

export const refreshClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

type PendingRequest = {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

let isRefreshing = false
let pendingRequests: PendingRequest[] = []

function onRefreshed(token: string) {
  pendingRequests.forEach((pending) => pending.resolve(token))
  pendingRequests = []
}

function onRefreshFailed(error: unknown) {
  pendingRequests.forEach((pending) => pending.reject(error))
  pendingRequests = []
}

function subscribeTokenRefresh(callback: PendingRequest) {
  pendingRequests.push(callback)
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const authState = getAuthState()

  if (authState && config.headers) {
    if (isAuthExpired(authState)) {
      if (!isRefreshing) {
        isRefreshing = true
        try {
          const response = await refreshClient.post(AUTH_ENDPOINTS.refresh, { refresh: authState.refreshToken })
          const payload = response.data?.data
          if (!payload?.access) {
            throw new Error('Token refresh response is invalid.')
          }
          const refreshedState: AuthState = {
            ...authState,
            accessToken: payload.access,
            refreshToken: payload.refresh ?? authState.refreshToken,
            expiresAt: payload.exp ? payload.exp * 1000 : Date.now() + 30 * 60 * 1000,
          }
          setAuthState(refreshedState)
          if (config.headers) {
            config.headers.Authorization = `Bearer ${refreshedState.accessToken}`
          }
          onRefreshed(refreshedState.accessToken)
        } catch (error) {
          clearAuthState()
          window.location.replace('/login')
          return config
        } finally {
          isRefreshing = false
        }
      } else {
        await new Promise<void>((resolve, reject) => {
          subscribeTokenRefresh({
            resolve: (token) => {
              if (config.headers) {
                config.headers.Authorization = `Bearer ${token}`
              }
              resolve()
            },
            reject,
          })
        })
      }
    } else {
      config.headers.Authorization = `Bearer ${authState.accessToken}`
    }
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config
    const authState = getAuthState()

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest.url?.includes(AUTH_ENDPOINTS.refresh) &&
      !originalRequest.url?.includes(AUTH_ENDPOINTS.login) &&
      authState
    ) {
      if (!isRefreshing) {
        isRefreshing = true
        try {
          const response = await refreshClient.post(AUTH_ENDPOINTS.refresh, { refresh: authState.refreshToken })
          const payload = response.data?.data
          if (!payload?.access) {
            throw new Error('Token refresh response is invalid.')
          }
          const refreshedState: AuthState = {
            ...authState,
            accessToken: payload.access,
            refreshToken: payload.refresh ?? authState.refreshToken,
            expiresAt: payload.exp ? payload.exp * 1000 : Date.now() + 30 * 60 * 1000,
          }
          setAuthState(refreshedState)
          onRefreshed(refreshedState.accessToken)
          } catch (refreshError) {
            clearAuthState()
            onRefreshFailed(refreshError)
            window.location.replace('/login')
            return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      return new Promise((resolve, reject) => {
        subscribeTokenRefresh({
          resolve: (token) => {
            if (!originalRequest.headers) return reject(error)
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(api(originalRequest))
          },
          reject,
        })
      })
    }

    return Promise.reject(error)
  },
)

export default api
