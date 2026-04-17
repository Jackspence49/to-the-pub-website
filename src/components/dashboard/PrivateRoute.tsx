"use client"

import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthToken, isTokenExpired } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

interface PrivateRouteProps {
  children: ReactNode
  redirectTo?: string
  fallback?: ReactNode
  checkTokenExpiry?: boolean
}

/**
 * PrivateRoute Component
 * 
 * Checks for JWT token existence in localStorage and redirects if not found
 * Uses proper hydration-safe pattern to prevent SSR/client mismatch
 * 
 * @param children - The component to render if authenticated
 * @param redirectTo - The route to redirect to if not authenticated (default: '/login')
 * @param fallback - Custom loading component (optional)
 * @param checkTokenExpiry - Whether to also check if token is expired (default: true)
 */
export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  redirectTo = '/login',
  fallback,
  checkTokenExpiry = true
}) => {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mark that we're now on the client side
    setIsClient(true)
    
    // Check authentication status
    const token = getAuthToken()
    
    // If no token exists, redirect to login
    if (!token) {
      console.log('No JWT token found, redirecting to login')
      router.push(redirectTo)
      return
    }

    // Optionally check if token is expired
    if (checkTokenExpiry && isTokenExpired()) {
      console.log('JWT token expired, redirecting to login')
      // Clear expired token and redirect
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      localStorage.removeItem('authTokenExpires')
      router.push(redirectTo)
      return
    }

    console.log('JWT token found and valid, rendering protected content')
    setIsAuthenticated(true)
    setIsLoading(false)
  }, [router, redirectTo, checkTokenExpiry])

  // Show loading state during SSR and initial client render
  if (!isClient || isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--vibrant-teal)]" />
            <p className="mt-4 text-sm text-gray-600">Checking authentication...</p>
          </div>
        </div>
      )
    )
  }

  // If not authenticated, show loading while redirect happens
  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--vibrant-teal)]" />
            <p className="mt-4 text-sm text-gray-600">Redirecting to login...</p>
          </div>
        </div>
      )
    )
  }

  // Token exists and is valid, render the protected content
  return <>{children}</>
}

/**
 * Higher-Order Component (HOC) version of PrivateRoute
 * 
 * Usage:
 * const ProtectedDashboard = withPrivateRoute(Dashboard, { redirectTo: '/login' })
 */
export const withPrivateRoute = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    redirectTo?: string
    fallback?: ReactNode
    checkTokenExpiry?: boolean
  }
) => {
  const PrivateComponent = (props: P) => (
    <PrivateRoute 
      redirectTo={options?.redirectTo}
      fallback={options?.fallback}
      checkTokenExpiry={options?.checkTokenExpiry}
    >
      <Component {...props} />
    </PrivateRoute>
  )
  
  PrivateComponent.displayName = `withPrivateRoute(${Component.displayName || Component.name})`
  return PrivateComponent
}