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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (adminInfo.password !== adminInfo.confirmPassword) {
      alert("Passwords do not match")
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
                    className="bg-background border-border-light text-foreground text-[var(--dark-sapphire)]"
                  />
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
                  <Input
                    id="state"
                    value={businessInfo.state}
                    onChange={(e) => handleBusinessInfoChange("state", e.target.value)}
                    placeholder="Enter state/province"
                    required
                    className="bg-background border-border-light text-foreground text-[var(--dark-sapphire)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal-code" className="text-foreground text-[var(--dark-sapphire)]">Postal Code *</Label>
                  <Input
                    id="postal-code"
                    value={businessInfo.postalCode}
                    onChange={(e) => handleBusinessInfoChange("postalCode", e.target.value)}
                    placeholder="Enter postal code"
                    required
                    className="bg-background border-border-light text-foreground text-[var(--dark-sapphire)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground text-[var(--dark-sapphire)]">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={businessInfo.phone}
                    onChange={(e) => handleBusinessInfoChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                    className="bg-background border-border-light text-foreground text-[var(--dark-sapphire)]"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="website" className="text-foreground text-[var(--dark-sapphire)]">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={businessInfo.website}
                    onChange={(e) => handleBusinessInfoChange("website", e.target.value)}
                    placeholder="https://www.example.com"
                    className="bg-background border-border-light text-foreground text-[var(--dark-sapphire)]"
                  />
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
                    className="bg-background border-border-light text-foreground text-[var(--dark-sapphire)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last-name" className="text-foreground text-[var(--dark-sapphire)]">Last Name *</Label>
                  <Input
                    id="last-name"
                    value={adminInfo.lastName}
                    onChange={(e) => handleAdminInfoChange("lastName", e.target.value)}
                    placeholder="Enter last name"
                    required
                    className="bg-background border-border-light text-foreground text-[var(--dark-sapphire)]"
                  />
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
                    className="bg-background border-border-light text-foreground text-[var(--dark-sapphire)]"
                  />
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
                      className="bg-background border-border-light text-foreground text-[var(--dark-sapphire)]"
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
                      className="bg-background border-border-light text-foreground text-[var(--dark-sapphire)]"
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
