import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import authApi from '../services/authService'
import { AuthCredentials, RegisterCredentials, UserProfile } from '../features/auth/types'
import { AuthState, clearAuthState, getAuthState, setAuthState } from './authStorage'

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  loading: boolean
  signIn: (credentials: AuthCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<AuthState | null>(null)

  useEffect(() => {
    const restoreSession = async () => {
      const stored = getAuthState()
      if (!stored) {
        setLoading(false)
        return
      }

      try {
        let activeSession = stored
        if (stored.expiresAt <= Date.now()) {
          activeSession = await authApi.refreshToken(stored.refreshToken)
          setAuthState(activeSession)
        }
        setSession(activeSession)
        setUser(activeSession.user)
        const profile = await authApi.getProfile()
        setUser(profile)
      } catch {
        clearAuthState()
        setSession(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  const signIn = async (credentials: AuthCredentials) => {
    setLoading(true)
    const response = await authApi.login(credentials)
    setAuthState(response)
    setSession(response)
    setUser(response.user)
    setLoading(false)
  }

  const register = async (credentials: RegisterCredentials) => {
    setLoading(true)
    await authApi.register(credentials)
    const authResponse = await authApi.login({ email: credentials.email, password: credentials.password })
    setAuthState(authResponse)
    setSession(authResponse)
    setUser(authResponse.user)
    setLoading(false)
  }

  const signOut = () => {
    const stored = getAuthState()
    if (stored) {
      authApi.logout(stored.refreshToken).catch(() => {
        clearAuthState()
      })
    }
    clearAuthState()
    setSession(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      signIn,
      register,
      signOut,
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
