"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { MapPin, Building, Clock, Tag, X } from "lucide-react"

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

interface Tag {
  name: string
  category: 'type' | 'amenity'
}

interface BusinessInfo {
  name: string
  streetAddress: string
  city: string
  state: string
  postalCode: string
  phone: string
  website: string
  latitude: number | null
  longitude: number | null
  tags: Tag[]
}

interface BarHours {
  dayOfWeek: number // 0=Sunday, 6=Saturday
  openTime: string
  closeTime: string
  isClosed: boolean
}

interface DayInfo {
  id: number
  name: string
  shortName: string
}


interface ValidationErrors {
  business?: {
    [key: string]: string
  }
  barHours?: {
    [key: string]: string
  }
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

const DAYS_OF_WEEK: DayInfo[] = [
  { id: 0, name: "Sunday", shortName: "Sun" },
  { id: 1, name: "Monday", shortName: "Mon" },
  { id: 2, name: "Tuesday", shortName: "Tue" },
  { id: 3, name: "Wednesday", shortName: "Wed" },
  { id: 4, name: "Thursday", shortName: "Thu" },
  { id: 5, name: "Friday", shortName: "Fri" },
  { id: 6, name: "Saturday", shortName: "Sat" }
]

const AVAILABLE_TAGS: Tag[] = [
  // Bar Types
  { name: 'Sports Bar', category: 'type' },
  { name: 'Dive Bar', category: 'type' },
  { name: 'College Bar', category: 'type' },
  { name: 'Cocktail Bar', category: 'type' },
  { name: 'Brewery', category: 'type' },
  { name: 'Wine Bar', category: 'type' },
  { name: 'Pub', category: 'type' },
  { name: 'Lounge', category: 'type' },
  { name: 'Rooftop', category: 'type' },
  { name: 'Night Club', category: 'type' },
  { name: 'Hotel Bar', category: 'type' },
  { name: 'Gay Bar', category: 'type' },
  { name: 'Arcade Bar', category: 'type' },
  { name: 'Resturant', category: 'type' },
  
  // Amenities
  { name: 'Pool Table', category: 'amenity' },
  { name: 'Darts', category: 'amenity' },
  { name: 'Pool Tables', category: 'amenity' },
  { name: 'Outdoor Seating', category: 'amenity' },
  { name: 'Food Served', category: 'amenity' },
  { name: 'Touch Tunes', category: 'amenity' },
  { name: 'Cash Only', category: 'amenity' },
  { name: 'Board Games', category: 'amenity' },
  { name: 'Waterfront', category: 'amenity' }
]


export default function Component() {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
    website: "",
    latitude: null,
    longitude: null,
    tags: [],
  })

  const [barHours, setBarHours] = useState<BarHours[]>(
    DAYS_OF_WEEK.map(day => ({
      dayOfWeek: day.id,
      openTime: "09:00",
      closeTime: "22:00",
      isClosed: false
    }))
  )


  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
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
          fields: ["name", "formatted_address", "address_components", "formatted_phone_number", "website", "geometry"],
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

      // Extract latitude and longitude from geometry
      let latitude = null
      let longitude = null
      if (place.geometry && place.geometry.location) {
        latitude = place.geometry.location.lat()
        longitude = place.geometry.location.lng()
      }

      setBusinessInfo({
        name: place.name || "",
        streetAddress: `${streetNumber} ${route}`.trim(),
        city: city,
        state: state,
        postalCode: postalCode,
        phone: place.formatted_phone_number || "",
        website: place.website || "",
        latitude: latitude,
        longitude: longitude,
        tags: [],
      })
    }
  }

  const handleBusinessInfoChange = (field: keyof BusinessInfo, value: string) => {
    setBusinessInfo((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleBarHoursChange = (dayOfWeek: number, field: keyof BarHours, value: string | boolean) => {
    setBarHours((prev) =>
      prev.map((hours) =>
        hours.dayOfWeek === dayOfWeek
          ? { ...hours, [field]: value }
          : hours
      )
    )
  }

  const handleTagAdd = (tag: Tag) => {
    setBusinessInfo((prev) => ({
      ...prev,
      tags: [...prev.tags, tag]
    }))
  }

  const handleTagRemove = (tagToRemove: Tag) => {
    setBusinessInfo((prev) => ({
      ...prev,
      tags: prev.tags.filter(tag => !(tag.name === tagToRemove.name && tag.category === tagToRemove.category))
    }))
  }



  const validateForm = (): boolean => {
    const errors: ValidationErrors = {
      business: {},
      barHours: {},
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

    // Bar Hours Validation
    barHours.forEach((hours, index) => {
      if (!hours.isClosed) {
        if (!hours.openTime) {
          errors.barHours![`${hours.dayOfWeek}_openTime`] = "Open time is required"
          isValid = false
        }
        if (!hours.closeTime) {
          errors.barHours![`${hours.dayOfWeek}_closeTime`] = "Close time is required"
          isValid = false
        }
        if (hours.openTime && hours.closeTime && hours.openTime >= hours.closeTime) {
          errors.barHours![`${hours.dayOfWeek}_times`] = "Close time must be after open time"
          isValid = false
        }
      }
    })

    setValidationErrors(errors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    console.log("Business Info:", businessInfo)
    console.log("Bar Hours:", barHours)
    console.log("Selected Tags:", businessInfo.tags)

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

          {/* Tags Section */}
          <Card className="border-border-light bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground text-[var(--dark-sapphire)]">
                <Tag className="h-5 w-5 text-accent" />
                Bar Tags
              </CardTitle>
              <CardDescription className="text-foreground/80 text-[var(--charcoal-gray)]">
                Select tags that describe your bar's type and amenities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selected Tags Display */}
              {businessInfo.tags.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-foreground text-[var(--dark-sapphire)] font-medium">Selected Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {businessInfo.tags.map((tag, index) => (
                      <div
                        key={`${tag.name}-${tag.category}-${index}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full text-sm"
                      >
                        <span>{tag.name}</span>
                        <button
                          type="button"
                          onClick={() => handleTagRemove(tag)}
                          className="hover:bg-accent/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tag Selection Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bar Type */}
                <div className="space-y-2">
                  <Label htmlFor="bar-type" className="text-foreground text-[var(--dark-sapphire)]">Bar Type</Label>
                  <select
                    id="bar-type"
                    onChange={(e) => {
                      if (e.target.value) {
                        const tag = AVAILABLE_TAGS.find(t => t.name === e.target.value && t.category === 'type')
                        if (tag && !businessInfo.tags.some(t => t.name === tag.name && t.category === tag.category)) {
                          handleTagAdd(tag)
                        }
                        e.target.value = ""
                      }
                    }}
                    className="w-full h-10 px-3 py-2 bg-background border border-border-light rounded-md text-foreground text-[var(--dark-sapphire)] focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Select bar type...</option>
                    {AVAILABLE_TAGS.filter(tag => tag.category === 'type').map((tag) => (
                      <option key={tag.name} value={tag.name}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amenities */}
                <div className="space-y-2">
                  <Label htmlFor="amenities" className="text-foreground text-[var(--dark-sapphire)]">Amenities</Label>
                  <select
                    id="amenities"
                    onChange={(e) => {
                      if (e.target.value) {
                        const tag = AVAILABLE_TAGS.find(t => t.name === e.target.value && t.category === 'amenity')
                        if (tag && !businessInfo.tags.some(t => t.name === tag.name && t.category === tag.category)) {
                          handleTagAdd(tag)
                        }
                        e.target.value = ""
                      }
                    }}
                    className="w-full h-10 px-3 py-2 bg-background border border-border-light rounded-md text-foreground text-[var(--dark-sapphire)] focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Select amenity...</option>
                    {AVAILABLE_TAGS.filter(tag => tag.category === 'amenity').map((tag) => (
                      <option key={tag.name} value={tag.name}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bar Hours Section */}
          <Card className="border-border-light bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground text-[var(--dark-sapphire)]">
                <Clock className="h-5 w-5 text-accent" />
                Bar Hours
              </CardTitle>
              <CardDescription className="text-foreground/80 text-[var(--charcoal-gray)]">
                Set your business hours for each day of the week. Leave times empty if closed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {DAYS_OF_WEEK.map((day) => {
                const dayHours = barHours.find(hours => hours.dayOfWeek === day.id)
                if (!dayHours) return null

                return (
                  <div key={day.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="md:col-span-1">
                      <Label className="text-foreground text-[var(--dark-sapphire)] font-medium">
                        {day.name}
                      </Label>
                    </div>
                    
                    <div className="md:col-span-1">
                      <Label htmlFor={`closed-${day.id}`} className="flex items-center gap-2 text-foreground text-[var(--dark-sapphire)]">
                        <input
                          type="checkbox"
                          id={`closed-${day.id}`}
                          checked={dayHours.isClosed}
                          onChange={(e) => handleBarHoursChange(day.id, "isClosed", e.target.checked)}
                          className="rounded border-border-light"
                        />
                        Closed
                      </Label>
                    </div>

                    <div className="md:col-span-1">
                      <Label htmlFor={`open-${day.id}`} className="text-foreground text-[var(--dark-sapphire)]">
                        Open Time
                      </Label>
                      <Input
                        id={`open-${day.id}`}
                        type="time"
                        value={dayHours.openTime}
                        onChange={(e) => handleBarHoursChange(day.id, "openTime", e.target.value)}
                        disabled={dayHours.isClosed}
                        className={`bg-background border-border-light text-foreground text-[var(--dark-sapphire)] ${
                          validationErrors.barHours?.[`${day.id}_openTime`] || validationErrors.barHours?.[`${day.id}_times`] ? "border-red-500" : ""
                        }`}
                      />
                      {validationErrors.barHours?.[`${day.id}_openTime`] && (
                        <p className="text-sm text-red-600">{validationErrors.barHours[`${day.id}_openTime`]}</p>
                      )}
                    </div>

                    <div className="md:col-span-1">
                      <Label htmlFor={`close-${day.id}`} className="text-foreground text-[var(--dark-sapphire)]">
                        Close Time
                      </Label>
                      <Input
                        id={`close-${day.id}`}
                        type="time"
                        value={dayHours.closeTime}
                        onChange={(e) => handleBarHoursChange(day.id, "closeTime", e.target.value)}
                        disabled={dayHours.isClosed}
                        className={`bg-background border-border-light text-foreground text-[var(--dark-sapphire)] ${
                          validationErrors.barHours?.[`${day.id}_closeTime`] || validationErrors.barHours?.[`${day.id}_times`] ? "border-red-500" : ""
                        }`}
                      />
                      {validationErrors.barHours?.[`${day.id}_closeTime`] && (
                        <p className="text-sm text-red-600">{validationErrors.barHours[`${day.id}_closeTime`]}</p>
                      )}
                    </div>

                    <div className="md:col-span-1">
                      {validationErrors.barHours?.[`${day.id}_times`] && (
                        <p className="text-sm text-red-600">{validationErrors.barHours[`${day.id}_times`]}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="lg" 
              className="px-8 bg-accent hover:bg-accent/90 text-white"
            >
              Add Business
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
