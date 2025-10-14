"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  fallback?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
  fallback
}) => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, isLoading, router, redirectTo])

  // Show loading state while checking authentication
  if (isLoading) {
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

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null // The useEffect will handle the redirect
  }

  // Render children if authenticated
  return <>{children}</>
}

// Higher-order component version
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options?: { redirectTo?: string; fallback?: React.ReactNode }
) => {
  const AuthenticatedComponent = (props: P) => (
    <ProtectedRoute 
      redirectTo={options?.redirectTo} 
      fallback={options?.fallback}
    >
      <Component {...props} />
    </ProtectedRoute>
  )
  
  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`
  return AuthenticatedComponent
}