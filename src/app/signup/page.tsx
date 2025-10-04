"use client"

import React, { useState } from "react"
import { User, Eye, EyeOff, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AdminInfo {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

interface ValidationErrors {
  business?: {
    [key: string]: string
  }
  admin?: {
    [key: string]: string
  }
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}


const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s'-]{2,50}$/
  return nameRegex.test(name)
}

const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

export default function Component() {

  const [adminInfo, setAdminInfo] = useState<AdminInfo>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const router = useRouter()


  const handleAdminInfoChange = (field: keyof AdminInfo, value: string) => {
    setAdminInfo((prev: AdminInfo) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {
      admin: {}
    }
    let isValid = true

    // Admin Info Validation
    if (!validateName(adminInfo.firstName)) {
      errors.admin!.firstName = "First name must contain only letters, spaces, hyphens, and apostrophes (2-50 characters)"
      isValid = false
    }

    if (!validateName(adminInfo.lastName)) {
      errors.admin!.lastName = "Last name must contain only letters, spaces, hyphens, and apostrophes (2-50 characters)"
      isValid = false
    }

    if (!validateEmail(adminInfo.email)) {
      errors.admin!.email = "Invalid email format"
      isValid = false
    }

    if (!validatePassword(adminInfo.password)) {
      errors.admin!.password = "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character"
      isValid = false
    }

    if (adminInfo.password !== adminInfo.confirmPassword) {
      errors.admin!.confirmPassword = "Passwords do not match"
      isValid = false
    }

    setValidationErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const full_name = `${adminInfo.firstName.trim()} ${adminInfo.lastName.trim()}`.trim()

      // Use internal server-side proxy to avoid exposing upstream URL to the browser
      const resp = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: adminInfo.email,
          password: adminInfo.password,
          full_name,
        }),
      })

      if (!resp.ok) {
        // try to parse error message from server
        let errMsg = `Request failed with status ${resp.status}`
        try {
          const json = await resp.json()
          if (json?.message) errMsg = json.message
          else if (typeof json === 'string') errMsg = json
        } catch {
          // ignore json parse errors, keep default message
        }
        throw new Error(errMsg)
      }

      // Success - navigate to business-login (or another page)
      router.push('/business-login')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Registration</h1>
          <p className="text-foreground/80 mt-2 text-[var(--light-gray)]">Create your account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {serverError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{serverError}</div>
          )}



          {/* Admin Information Section */}
          <Card className="bg-white border-border-light">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground text-[var(--dark-sapphire)]">
                <User className="h-5 w-5 text-accent" />
                Administrator Information
              </CardTitle>
              <CardDescription className="text-foreground/80 text-[var(--dark-sapphire)]">
                Create the admin account for managing your business profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name" className="text-foreground text-[var(--dark-sapphire)]">First Name *</Label>
                  <Input
                    id="first-name"
                    value={adminInfo.firstName}
                    onChange={(e) => handleAdminInfoChange("firstName", e.target.value)}
                    placeholder="Enter first name"
                    required
                    className={`bg-background border-border-light text-foreground text-[var(--dark-sapphire)] ${
                      validationErrors.admin?.firstName ? "border-red-500" : ""
                    }`}
                  />
                  {validationErrors.admin?.firstName && (
                    <p className="text-sm text-red-600">{validationErrors.admin.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last-name" className="text-foreground text-[var(--dark-sapphire)]">Last Name *</Label>
                  <Input
                    id="last-name"
                    value={adminInfo.lastName}
                    onChange={(e) => handleAdminInfoChange("lastName", e.target.value)}
                    placeholder="Enter last name"
                    required
                    className={`bg-background border-border-light text-foreground text-[var(--dark-sapphire)] ${
                      validationErrors.admin?.lastName ? "border-red-500" : ""
                    }`}
                  />
                  {validationErrors.admin?.lastName && (
                    <p className="text-sm text-red-600">{validationErrors.admin.lastName}</p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="email" className="text-foreground text-[var(--dark-sapphire)]">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={adminInfo.email}
                    onChange={(e) => handleAdminInfoChange("email", e.target.value)}
                    placeholder="admin@example.com"
                    required
                    className={`bg-background border-border-light text-foreground text-[var(--dark-sapphire)] ${
                      validationErrors.admin?.email ? "border-red-500" : ""
                    }`}
                  />
                  {validationErrors.admin?.email && (
                    <p className="text-sm text-red-600">{validationErrors.admin.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground text-[var(--dark-sapphire)]">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={adminInfo.password}
                      onChange={(e) => handleAdminInfoChange("password", e.target.value)}
                      placeholder="Create a strong password"
                      required
                      className={`bg-background border-border-light text-foreground text-[var(--dark-sapphire)] ${
                        validationErrors.admin?.password ? "border-red-500" : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-accent" /> : <Eye className="h-4 w-4 text-accent" />}
                    </Button>
                  </div>
                  {validationErrors.admin?.password && (
                    <p className="text-sm text-red-600">{validationErrors.admin.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-foreground text-[var(--dark-sapphire)]">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={adminInfo.confirmPassword}
                      onChange={(e) => handleAdminInfoChange("confirmPassword", e.target.value)}
                      placeholder="Confirm your password"
                      required
                      className={`bg-background border-border-light text-foreground text-[var(--dark-sapphire)] ${
                        validationErrors.admin?.confirmPassword ? "border-red-500" : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4 text-accent" /> : <Eye className="h-4 w-4 text-accent" />}
                    </Button>
                  </div>
                  {validationErrors.admin?.confirmPassword && (
                    <p className="text-sm text-red-600">{validationErrors.admin.confirmPassword}</p>
                  )}
                </div>
              </div>

              {adminInfo.password && adminInfo.confirmPassword && adminInfo.password !== adminInfo.confirmPassword && (
                <p className="text-sm text-red-600">Passwords do not match</p>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              className="px-8 bg-accent hover:bg-accent/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}