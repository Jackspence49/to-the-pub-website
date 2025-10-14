# PrivateRoute Component and Hook Usage Examples

This document demonstrates how to use the custom PrivateRoute component and usePrivateRoute hook to protect routes and check JWT token existence.

## PrivateRoute Component Usage

### Basic Usage

```tsx
import { PrivateRoute } from "@/components/auth/PrivateRoute"

export default function Dashboard() {
  return (
    <PrivateRoute>
      <div>
        <h1>Protected Dashboard</h1>
        <p>This content is only visible to authenticated users</p>
      </div>
    </PrivateRoute>
  )
}
```

### With Custom Redirect Path

```tsx
import { PrivateRoute } from "@/components/auth/PrivateRoute"

export default function AdminPanel() {
  return (
    <PrivateRoute redirectTo="/unauthorized">
      <div>
        <h1>Admin Panel</h1>
        <p>Admin-only content</p>
      </div>
    </PrivateRoute>
  )
}
```

### With Custom Loading Component

```tsx
import { PrivateRoute } from "@/components/auth/PrivateRoute"
import { Spinner } from "@/components/ui/spinner"

const CustomLoader = () => (
  <div className="flex justify-center items-center min-h-screen">
    <Spinner />
    <p>Verifying access...</p>
  </div>
)

export default function SecurePage() {
  return (
    <PrivateRoute 
      fallback={<CustomLoader />}
      checkTokenExpiry={true}
    >
      <div>Protected Content</div>
    </PrivateRoute>
  )
}
```

### Higher-Order Component (HOC) Pattern

```tsx
import { withPrivateRoute } from "@/components/auth/PrivateRoute"

const UserProfile = () => {
  return (
    <div>
      <h1>User Profile</h1>
      <p>User-specific content</p>
    </div>
  )
}

// Wrap component with private route protection
export default withPrivateRoute(UserProfile, {
  redirectTo: '/login',
  checkTokenExpiry: true
})
```

## usePrivateRoute Hook Usage

### Basic Hook Usage

```tsx
"use client"

import { usePrivateRoute } from "@/hooks/usePrivateRoute"
import { Loader2 } from "lucide-react"

export default function ProtectedPage() {
  const { isAuthorized, isChecking, token } = usePrivateRoute()

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin" />
        <p>Checking authentication...</p>
      </div>
    )
  }

  // This will automatically redirect if not authorized
  // But we can also handle it manually if needed
  if (!isAuthorized) {
    return null // Component won't render, redirect will happen
  }

  return (
    <div>
      <h1>Protected Content</h1>
      <p>Token exists: {token ? 'Yes' : 'No'}</p>
      <p>Welcome to the protected area!</p>
    </div>
  )
}
```

### Hook with Custom Options

```tsx
"use client"

import { usePrivateRoute } from "@/hooks/usePrivateRoute"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const router = useRouter()
  
  const { isAuthorized, isChecking, redirectToLogin } = usePrivateRoute({
    redirectTo: '/admin-login',
    checkTokenExpiry: true,
    onUnauthorized: () => {
      console.log('Admin access denied')
      // Could show a toast notification here
    }
  })

  const handleManualLogout = () => {
    localStorage.removeItem('authToken')
    redirectToLogin()
  }

  if (isChecking) {
    return <div>Loading admin dashboard...</div>
  }

  if (!isAuthorized) {
    return null // Redirect will happen automatically
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <button onClick={handleManualLogout}>
        Manual Logout
      </button>
      <div>Admin-specific content here</div>
    </div>
  )
}
```

### Hook for Conditional Rendering

```tsx
"use client"

import { usePrivateRoute } from "@/hooks/usePrivateRoute"
import { SignInForm } from "@/components/cards/signin-form"

export default function ConditionalPage() {
  const { isAuthorized, isChecking } = usePrivateRoute({
    redirectTo: null, // Don't auto-redirect, handle manually
    checkTokenExpiry: true
  })

  if (isChecking) {
    return <div>Checking access...</div>
  }

  // Render different content based on auth status
  return (
    <div>
      {isAuthorized ? (
        <div>
          <h1>Welcome Back!</h1>
          <p>You are logged in and can see this content.</p>
        </div>
      ) : (
        <div>
          <h1>Please Sign In</h1>
          <SignInForm />
        </div>
      )}
    </div>
  )
}
```

## Layout Protection

### Protecting Entire Layout

```tsx
// app/dashboard/layout.tsx
import { PrivateRoute } from "@/components/auth/PrivateRoute"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PrivateRoute>
      <div className="dashboard-layout">
        <nav>Dashboard Navigation</nav>
        <main>{children}</main>
      </div>
    </PrivateRoute>
  )
}
```

### Using Hook in Layout

```tsx
// app/admin/layout.tsx
"use client"

import { usePrivateRoute } from "@/hooks/usePrivateRoute"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthorized, isChecking } = usePrivateRoute({
    redirectTo: '/login'
  })

  if (isChecking) {
    return <div>Loading admin area...</div>
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="admin-layout">
      <header>Admin Header</header>
      <aside>Admin Sidebar</aside>
      <main>{children}</main>
    </div>
  )
}
```

## Middleware Alternative (Advanced)

You can also create Next.js middleware for route protection:

```tsx
// middleware.ts (in root directory)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get token from cookies or headers
  const token = request.cookies.get('authToken')?.value

  // Define protected paths
  const protectedPaths = ['/dashboard', '/admin', '/profile']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  // Redirect if accessing protected path without token
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/profile/:path*']
}
```

## Key Features

### PrivateRoute Component:
- ✅ Checks JWT token existence in localStorage
- ✅ Handles token expiration validation
- ✅ Automatic redirect to login on unauthorized access  
- ✅ Customizable redirect paths
- ✅ Custom loading components
- ✅ HOC pattern support

### usePrivateRoute Hook:
- ✅ Reactive authentication state
- ✅ Manual redirect control
- ✅ Cross-tab synchronization
- ✅ Custom unauthorized callbacks
- ✅ Token expiry checking
- ✅ Loading states

Both solutions provide robust JWT-based route protection with flexibility for different use cases!