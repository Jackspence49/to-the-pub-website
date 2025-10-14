// Authentication utility functions for managing JWT tokens

export interface User {
  id: string
  email: string
  name?: string
  role?: string
  [key: string]: unknown
}

export interface AuthTokens {
  token: string
  expiresAt?: string
  user?: User
}

/**
 * Store authentication token and related data in localStorage
 */
export const storeAuthTokens = (data: {
  token?: string
  jwt?: string
  accessToken?: string
  user?: User
  expiresAt?: string | number
  exp?: number
}): void => {
  const token = data.token || data.jwt || data.accessToken
  
  if (!token) {
    throw new Error('No authentication token provided')
  }

  localStorage.setItem('authToken', token)
  
  // Store user data if provided
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user))
  }
  
  // Handle token expiration
  if (data.expiresAt) {
    const expiresAt = typeof data.expiresAt === 'string' ? data.expiresAt : data.expiresAt.toString()
    localStorage.setItem('authTokenExpires', expiresAt)
  } else if (data.exp) {
    // Convert Unix timestamp to milliseconds
    const expiresAt = (data.exp * 1000).toString()
    localStorage.setItem('authTokenExpires', expiresAt)
  }
}

/**
 * Retrieve authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('authToken')
}

/**
 * Retrieve stored user data
 */
export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

/**
 * Check if the current token is expired
 */
export const isTokenExpired = (): boolean => {
  if (typeof window === 'undefined') return true
  
  const expiresAt = localStorage.getItem('authTokenExpires')
  if (!expiresAt) return false // If no expiry set, assume it's valid
  
  const expiryTime = parseInt(expiresAt, 10)
  return Date.now() > expiryTime
}

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = (): boolean => {
  const token = getAuthToken()
  return !!(token && !isTokenExpired())
}

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthTokens = (): void => {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
  localStorage.removeItem('authTokenExpires')
}

/**
 * Get authorization header for API requests
 */
export const getAuthHeader = (): { Authorization: string } | Record<string, never> => {
  const token = getAuthToken()
  if (!token || isTokenExpired()) {
    return {}
  }
  return { Authorization: `Bearer ${token}` }
}

/**
 * Alternative session storage methods (if you prefer session-only storage)
 */
export const sessionAuth = {
  store: (data: AuthTokens): void => {
    if (typeof window === 'undefined') return
    sessionStorage.setItem('authToken', data.token)
    if (data.user) sessionStorage.setItem('user', JSON.stringify(data.user))
    if (data.expiresAt) sessionStorage.setItem('authTokenExpires', data.expiresAt)
  },
  
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null
    return sessionStorage.getItem('authToken')
  },
  
  clear: (): void => {
    if (typeof window === 'undefined') return
    sessionStorage.removeItem('authToken')
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('authTokenExpires')
  }
}