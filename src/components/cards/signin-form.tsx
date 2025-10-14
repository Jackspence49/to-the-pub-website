"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import { storeAuthTokens } from "@/lib/auth"
import { useAuth } from "@/hooks/useAuth"

export function SignInForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    general?: string
  }>({})

  const validatePassword = (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return passwordRegex.test(password)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Basic validation
    const newErrors: typeof errors = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      // Use internal server-side proxy to avoid exposing upstream URL to the browser
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Sign in failed')
      }

      const response_data = await response.json()
      
      // Store JWT token securely using our auth utility
      // This handles localStorage storage with proper error handling
      try {
        const userData = {
          id: response_data.data.id,
          email: response_data.data.email,
          name: response_data.data.full_name,
          role: response_data.data.role
        }
        
        storeAuthTokens({
          token: response_data.token,
          user: userData
        })
        
        // Update auth context state
        login(userData, response_data.token)
      } catch {
        throw new Error('Authentication successful but failed to store token')
      }

      // Successful login - navigate to dashboard
      router.push('/dashboard')
    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : "Sign in failed. Please try again." 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{errors.general}</div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-[var(--charcoal-gray)]">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          className={`w-full text-[var(--charcoal-gray)] ${
            errors.email
              ? "border-red-500 focus:ring-red-500"
              : "border-[var(--light-gray)] focus:ring-[var(--vibrant-teal)] focus:border-[var(--vibrant-teal)]"
          }`}
          disabled={isLoading}
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-[var(--charcoal-gray)]">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className={`w-full pr-10 text-[var(--charcoal-gray)] ${
              errors.password
                ? "border-red-500 focus:ring-red-500"
                : "border-[var(--light-gray)] focus:ring-[var(--vibrant-teal)] focus:border-[var(--vibrant-teal)]"
            }`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
      </div>

      <div className="flex items-center justify-between">
        <Link href="/forgot-password" className="text-sm text-[var(--vibrant-teal)] hover:text-[var(--vibrant-teal)]/80 transition-colors">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" className="w-full bg-[var(--vibrant-teal)] hover:bg-[var(--vibrant-teal)]/90 text-white" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  )
}
