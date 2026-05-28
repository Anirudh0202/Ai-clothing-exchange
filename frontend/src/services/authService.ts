import api, { refreshClient } from '../api/axios'
import { AuthCredentials, AuthResponse, AuthPayload, UserProfile } from '../features/auth/types'
import { AUTH_ENDPOINTS } from '../api/endpoints'
import { createAuthState, AuthState } from '../auth/authStorage'

function parseLoginResponse(payload: AuthPayload): AuthResponse {
  if (!payload.success || !payload.data) {
    throw new Error(payload.message || 'Login failed.')
  }
  const tokens = payload.data.tokens
  const user = payload.data.user as UserProfile
  if (!tokens?.access || !tokens?.refresh || !user) {
    throw new Error('Invalid login response from server.')
  }
  return {
    accessToken: tokens.access,
    refreshToken: tokens.refresh,
    user,
  }
}

const authService = {
  login: async (credentials: AuthCredentials): Promise<AuthState> => {
    const response = await api.post<AuthPayload>(AUTH_ENDPOINTS.login, credentials)
    const auth = parseLoginResponse(response.data)
    return createAuthState({ access: auth.accessToken, refresh: auth.refreshToken }, auth.user)
  },

  register: async (credentials: AuthCredentials): Promise<UserProfile> => {
    const response = await api.post<AuthPayload>(AUTH_ENDPOINTS.register, credentials)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Registration failed.')
    }
    return response.data.data as UserProfile
  },

  refreshToken: async (refreshToken: string): Promise<AuthState> => {
    const response = await refreshClient.post<AuthPayload>(AUTH_ENDPOINTS.refresh, { refresh: refreshToken })
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Token refresh failed.')
    }
    const tokens = response.data.data as { access: string; refresh: string }
    const currentAuth = localStorage.getItem('ai_clothing_exchange_auth')
    const parsed = currentAuth ? (JSON.parse(currentAuth) as AuthState) : null
    if (!parsed) {
      throw new Error('No active auth session available.')
    }
    return createAuthState(tokens, parsed.user)
  },

  logout: async (refreshToken: string) => {
    const response = await api.post<AuthPayload>(AUTH_ENDPOINTS.logout, { refresh: refreshToken })
    if (!response.data.success) {
      throw new Error(response.data.message || 'Logout failed.')
    }
  },

  getProfile: async () => {
    const response = await api.get<AuthPayload>(AUTH_ENDPOINTS.me)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to load profile.')
    }
    return response.data.data as UserProfile
  },
}

export default authService
