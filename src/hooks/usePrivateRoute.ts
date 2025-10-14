"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthToken, isTokenExpired } from '@/lib/auth'

interface UsePrivateRouteOptions {
  redirectTo?: string
  checkTokenExpiry?: boolean
  onUnauthorized?: () => void
}

interface UsePrivateRouteReturn {
  isAuthorized: boolean
  isChecking: boolean
  token: string | null
  redirectToLogin: () => void
}

/**
 * usePrivateRoute Hook
 * 
 * Custom hook that checks JWT token existence and handles redirects
 * 
 * @param options - Configuration options
 * @returns Object with authorization state and utilities
 */
export const usePrivateRoute = (options: UsePrivateRouteOptions = {}): UsePrivateRouteReturn => {
  const {
    redirectTo = '/login',
    checkTokenExpiry = true,
    onUnauthorized
  } = options

  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  const redirectToLogin = useCallback(() => {
    console.log('Redirecting to login due to unauthorized access')
    if (onUnauthorized) {
      onUnauthorized()
    }
    router.push(redirectTo)
  }, [router, redirectTo, onUnauthorized])

  const clearExpiredToken = useCallback(() => {
    console.log('Clearing expired token')
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('authTokenExpires')
    setToken(null)
    setIsAuthorized(false)
  }, [])

  useEffect(() => {
    const checkAuthorization = () => {
      setIsChecking(true)

      // Check if JWT token exists in localStorage
      const currentToken = getAuthToken()
      setToken(currentToken)

      // If no token exists, redirect to login
      if (!currentToken) {
        console.log('No JWT token found in usePrivateRoute')
        setIsAuthorized(false)
        setIsChecking(false)
        redirectToLogin()
        return
      }

      // Optionally check if token is expired
      if (checkTokenExpiry && isTokenExpired()) {
        console.log('JWT token expired in usePrivateRoute')
        clearExpiredToken()
        setIsChecking(false)
        redirectToLogin()
        return
      }

      // Token exists and is valid
      console.log('JWT token found and valid in usePrivateRoute')
      setIsAuthorized(true)
      setIsChecking(false)
    }

    checkAuthorization()

    // Listen for storage changes to handle logout in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        if (!e.newValue) {
          // Token was removed in another tab
          setToken(null)
          setIsAuthorized(false)
          redirectToLogin()
        } else {
          // Token was updated, recheck authorization
          checkAuthorization()
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [checkTokenExpiry, clearExpiredToken, redirectToLogin])

  return {
    isAuthorized,
    isChecking,
    token,
    redirectToLogin
  }
}