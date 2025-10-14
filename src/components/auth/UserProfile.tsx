"use client"

import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'

export const UserProfile: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
        <User className="h-4 w-4 text-gray-600" />
        <div className="text-sm">
          <div className="font-medium text-gray-900">{user.name || user.role}</div>
          {user.name && (
            <div className="text-gray-500 text-xs">{user.role}</div>
          )}
        </div>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  )
}

// Simple logout button component
export const LogoutButton: React.FC<{ 
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}> = ({ variant = "outline", size = "sm", className = "" }) => {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={className}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  )
}