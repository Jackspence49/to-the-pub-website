"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { 
  isAuthenticated, 
  getAuthToken, 
  getStoredUser, 
  clearAuthTokens,
  type User 
} from '@/lib/auth'

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  login: (user: User, token: string) => void
  logout: () => void
  refreshAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true
  })

  // Check authentication status
  const checkAuth = useCallback(() => {
    const authenticated = isAuthenticated()
    const token = getAuthToken()
    const user = getStoredUser()
    
    setAuthState({
      isAuthenticated: authenticated,
      user,
      token,
      isLoading: false
    })
  }, [])

  // Login function
  const login = useCallback((user: User, token: string) => {
    setAuthState({
      isAuthenticated: true,
      user,
      token,
      isLoading: false
    })
  }, [])

  // Logout function
  const logout = useCallback(() => {
    clearAuthTokens()
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false
    })
  }, [])

  // Force refresh auth state
  const refreshAuth = useCallback(() => {
    checkAuth()
  }, [checkAuth])

  // Check auth on mount and set up storage event listener
  useEffect(() => {
    checkAuth()

    // Listen for storage events to sync auth state across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' || e.key === 'user') {
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [checkAuth])

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}