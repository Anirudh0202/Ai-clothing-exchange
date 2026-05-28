export interface AuthCredentials {
  email: string
  password: string
  username?: string
}

export interface RegisterCredentials {
  email: string
  username: string
  password: string
  password2: string
  first_name?: string
  last_name?: string
}

export interface UserProfile {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: UserProfile
}

export interface AuthPayload {
  success: boolean
  message?: string
  data?: any
  errors?: Record<string, unknown>
}
