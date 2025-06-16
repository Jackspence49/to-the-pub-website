"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { MapPin, Building, User, Eye, EyeOff } from "lucide-react"

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

interface BusinessInfo {
  name: string
  streetAddress: string
  city: string
  state: string
  postalCode: string
  phone: string
  website: string
}

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

const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return true // Optional field
  const phoneRegex = /^\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})$/
  return phoneRegex.test(phone)
}

const validateWebsite = (website: string): boolean => {
  if (!website) return true // Optional field
  // Regex that accepts full URLs with paths and protocols
  const websiteRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9][a-zA-Z0-9-]*)*\.[a-zA-Z]{2,}(\/[^\s]*)?$/
  return websiteRegex.test(website.trim())
}

const validatePostalCode = (postalCode: string): boolean => {
  // US ZIP code format (5 digits or ZIP+4)
  const usZipRegex = /^\d{5}(?:[-\s]\d{4})?$/
  return usZipRegex.test(postalCode)
}

const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s'-]{2,50}$/
  return nameRegex.test(name)
}

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "DC", label: "District of Columbia" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" }
]

const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

export default function Component() {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
    website: "",
  })

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
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
  const autocompleteRef = useRef<HTMLInputElement>(null)
  const autocompleteInstance = useRef<any>(null)

  useEffect(() => {
    // Load Google Places API
    const loadGoogleMaps = () => {
      if (window.google) {
        initializeAutocomplete()
        return
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existingScript) {
        return
      }

      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => {
        setIsGoogleLoaded(true)
        initializeAutocomplete()
      }
      document.head.appendChild(script)
    }

    const initializeAutocomplete = () => {
      if (autocompleteRef.current && window.google) {
        autocompleteInstance.current = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
          types: ["establishment"],
          fields: ["name", "formatted_address", "address_components", "formatted_phone_number", "website"],
        })

        autocompleteInstance.current.addListener("place_changed", handlePlaceSelect)
      }
    }

    loadGoogleMaps()

    return () => {
      if (autocompleteInstance.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteInstance.current)
      }
    }
  }, [])

  const handlePlaceSelect = () => {
    const place = autocompleteInstance.current.getPlace()

    if (place && place.address_components) {
      const addressComponents = place.address_components

      let streetNumber = ""
      let route = ""
      let city = ""
      let state = ""
      let postalCode = ""

      addressComponents.forEach((component: any) => {
        const types = component.types

        if (types.includes("street_number")) {
          streetNumber = component.long_name
        }
        if (types.includes("route")) {
          route = component.long_name
        }
        if (types.includes("locality")) {
          city = component.long_name
        }
        if (types.includes("administrative_area_level_1")) {
          state = component.short_name
        }
        if (types.includes("postal_code")) {
          postalCode = component.long_name
        }
      })

      setBusinessInfo({
        name: place.name || "",
        streetAddress: `${streetNumber} ${route}`.trim(),
        city: city,
        state: state,
        postalCode: postalCode,
        phone: place.formatted_phone_number || "",
        website: place.website || "",
      })
    }
  }

  const handleBusinessInfoChange = (field: keyof BusinessInfo, value: string) => {
    setBusinessInfo((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAdminInfoChange = (field: keyof AdminInfo, value: string) => {
    setAdminInfo((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {
      business: {},
      admin: {}
    }
    let isValid = true

    // Business Info Validation
    if (!businessInfo.name.trim()) {
      errors.business!.name = "Business name is required"
      isValid = false
    }

    if (!businessInfo.streetAddress.trim()) {
      errors.business!.streetAddress = "Street address is required"
      isValid = false
    }

    if (!businessInfo.city.trim()) {
      errors.business!.city = "City is required"
      isValid = false
    }

    if (!businessInfo.state.trim()) {
      errors.business!.state = "State is required"
      isValid = false
    }

    if (!validatePostalCode(businessInfo.postalCode)) {
      errors.business!.postalCode = "Invalid postal code format"
      isValid = false
    }

    if (businessInfo.phone && !validatePhoneNumber(businessInfo.phone)) {
      errors.business!.phone = "Invalid phone number format"
      isValid = false
    }

    if (businessInfo.website && !validateWebsite(businessInfo.website)) {
      errors.business!.website = "Invalid website URL format"
      isValid = false
    }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    console.log("Business Info:", businessInfo)
    console.log("Admin Info:", adminInfo)

    // Here you would typically send the data to your backend
    alert("Form submitted successfully!")
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Business Registration</h1>
          <p className="text-foreground/80 mt-2 text-[var(--light-gray)]">Create your business account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Information Section */}
          <Card className="border-border-light bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground text-[var(--dark-sapphire)]">
                <Building className="h-5 w-5 text-accent" />
                Business Information
              </CardTitle>
              <CardDescription className="text-foreground/80 tex text-[var(--charcoal-gray)]">
                Search for your business to auto-populate information, then review and edit as needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business-search" className="text-foreground text-[var(--dark-sapphire)]">Search for your business</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-accent" />
                  <Input
                    ref={autocompleteRef}
                    id="business-search"
                    placeholder="Start typing your business name or address..."
                    className="pl-10 bg-background border-border-light text-foreground text-[var(--dark-sapphire)]"
                  />
                </div>
                <p className="text-sm text-foreground/60 text-[var(--dark-sapphire)]">
                  Start typing to search for your business and auto-fill the information below.
                </p>
              </div>

              <Separator className="bg-border-light" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="business-name" className="text-foreground text-[var(--dark-sapphire)]">Business Name *</Label>
                  <Input
                    id="business-name"
                    value={businessInfo.name}
                    onChange={(e) => handleBusinessInfoChange("name", e.target.value)}
                    placeholder="Enter business name"
                    required
                    className={`bg-background border-border-light text-foreground text-[var(--dark-sapphire)] ${
                      validationErrors.business?.name ? "border-red-500" : ""
                    }`}
                  />
                  {validationErrors.business?.name && (
                    <p className="text-sm text-red-600">{validationErrors.business.name}</p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="street-address" className="text-foreground text-[var(--dark-sapphire)]">Street Address *</Label>
                  <Input
                    id="street-address"
                    value={businessInfo.streetAddress}
                    onChange={(e) => handleBusinessInfoChange("streetAddress", e.target.value)}
                    placeholder="Enter street address"
                    required
                    className="bg-background border-border-light text-foreground text-[var(--dark-sapphire)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-foreground text-[var(--dark-sapphire)]">City *</Label>
                  <Input
                    id="city"
                    value={businessInfo.city}
                    onChange={(e) => handleBusinessInfoChange("city", e.target.value)}
                    placeholder="Enter city"
                    required
                    className="bg-background border-border-light text-foreground text-[var(--dark-sapphire)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-foreground text-[var(--dark-sapphire)]">State/Province *</Label>
                  <select
                    id="state"
                    value={businessInfo.state}
                    onChange={(e) => handleBusinessInfoChange("state", e.target.value)}
                    required
                    className="w-full h-10 px-3 py-2 bg-background border border-border-light rounded-md text-foreground text-[var(--dark-sapphire)] focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Select a state</option>
                    {US_STATES.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal-code" className="text-foreground text-[var(--dark-sapphire)]">Postal Code *</Label>
                  <Input
                    id="postal-code"
                    value={businessInfo.postalCode}
                    onChange={(e) => handleBusinessInfoChange("postalCode", e.target.value)}
                    placeholder="Enter a 5-digit Zip Code or Zip+4 (e.g., 12345 or 12345-6789)"
                    required
                    className={`bg-background border-border-light text-foreground text-[var(--dark-sapphire)] ${
                      validationErrors.business?.postalCode ? "border-red-500" : ""
                    }`}
                  />
                  {validationErrors.business?.postalCode && (
                    <p className="text-sm text-red-600">{validationErrors.business.postalCode}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground text-[var(--dark-sapphire)]">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={businessInfo.phone}
                    onChange={(e) => handleBusinessInfoChange("phone", e.target.value)}
                    placeholder="Enter phone number (e.g., 123-456-7890)"
                    className={`bg-background border-border-light text-foreground text-[var(--dark-sapphire)] ${
                      validationErrors.business?.phone ? "border-red-500" : ""
                    }`}
                  />
                  {validationErrors.business?.phone && (
                    <p className="text-sm text-red-600">{validationErrors.business.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="website" className="text-foreground text-[var(--dark-sapphire)]">Website</Label>
                  <Input
                    id="website"
                    type="text"
                    value={businessInfo.website}
                    onChange={(e) => handleBusinessInfoChange("website", e.target.value)}
                    placeholder="https://www.example.com"
                    className={`bg-background border-border-light text-foreground text-[var(--dark-sapphire)] ${
                      validationErrors.business?.website ? "border-red-500" : ""
                    }`}
                  />
                  {validationErrors.business?.website && (
                    <p className="text-sm text-red-600">{validationErrors.business.website}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

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
            >
              Create Business Account
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-foreground/60">
          <p>
            By creating an account, you agree to our{" "}
            <a href="#" className="text-accent hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-accent hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
