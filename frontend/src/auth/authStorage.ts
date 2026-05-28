import { UserProfile } from '../features/auth/types'

const STORAGE_KEY = 'ai_clothing_exchange_auth'

export interface AuthState {
  accessToken: string
  refreshToken: string
  user: UserProfile
  expiresAt: number
}

function decodeJwtPayload(token: string) {
  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(base64)
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function createAuthState(tokens: { access: string; refresh: string }, user: UserProfile): AuthState {
  const payload = decodeJwtPayload(tokens.access)
  const expiresAt = payload?.exp ? payload.exp * 1000 : Date.now() + 30 * 60 * 1000
  return {
    accessToken: tokens.access,
    refreshToken: tokens.refresh,
    user,
    expiresAt,
  }
}

export function getAuthState(): AuthState | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthState
  } catch {
    return null
  }
}

export function setAuthState(authState: AuthState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(authState))
}

export function clearAuthState() {
  localStorage.removeItem(STORAGE_KEY)
}

export function isAuthExpired(authState?: AuthState) {
  if (!authState) return true
  return Date.now() >= authState.expiresAt - 60 * 1000
}

export function getAccessToken() {
  return getAuthState()?.accessToken || null
}

export function getRefreshToken() {
  return getAuthState()?.refreshToken || null
}
