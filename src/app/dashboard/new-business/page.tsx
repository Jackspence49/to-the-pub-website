"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import BusinessInfoCard from "@/components/cards/BusinessInfoCard"
import TagsCard from "@/components/cards/TagsCard"
import BarHoursCard from "@/components/cards/BarHoursCard"
import { api } from "@/lib/api"
import { toast } from 'sonner'

declare global {
  interface Window {
    google: unknown
    initMap: () => void
  }
}

interface Tag {
  id?: number | string
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

// Helper to safely extract an error message from unknown values
const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message
  try {
    return String(err)
  } catch {
    return "Unknown error"
  }
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


// Helper functions to create fresh initial state
const createInitialBusinessInfo = (): BusinessInfo => ({
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

const createInitialBarHours = (): BarHours[] => DAYS_OF_WEEK.map(day => ({
  dayOfWeek: day.id,
  openTime: "09:00",
  closeTime: "22:00",
  isClosed: false
}))

export default function Component() {
  // Initial state values
  const initialBusinessInfo = createInitialBusinessInfo()
  const initialBarHours = createInitialBarHours()

  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(initialBusinessInfo)

  const [barHours, setBarHours] = useState<BarHours[]>(initialBarHours)


  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  // removed isGoogleLoaded (unused) and use a safer unknown type for autocomplete instance
  const autocompleteRef = useRef<HTMLInputElement>(null)
  // Minimal typing for the Google Autocomplete instance we use
  type AutocompleteInstance = {
    addListener: (eventName: string, handler: () => void) => void
    getPlace: () => unknown
  }
  const autocompleteInstance = useRef<AutocompleteInstance | null>(null)

  // Tags fetched from backend (no local fallback)
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [tagsLoading, setTagsLoading] = useState<boolean>(false)
  const [tagsError, setTagsError] = useState<string | null>(null)
  // Use the server-side proxy to avoid browser CORS issues
  const TAGS_ENDPOINT = "/api/tags"
  const BARS_ENDPOINT = "/api/bars"
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [formResetKey, setFormResetKey] = useState<number>(0)

  useEffect(() => {
    let mounted = true
    const fetchTags = async () => {
      setTagsLoading(true)
      setTagsError(null)
      try {
        const data = await api.get(TAGS_ENDPOINT, { requireAuth: true }).then(res => res.json())

        // Normalize response: accept an array or an object with `tags` or `data` fields
        let tags: Tag[] = []
        if (Array.isArray(data)) {
          tags = data
        } else if (Array.isArray(data.tags)) {
          tags = data.tags
        } else if (Array.isArray(data.data)) {
          tags = data.data
        }

        if (mounted) {
          // Upstream may return [] - keep whatever the upstream sent
          setAvailableTags(tags)
        }
      } catch (err: unknown) {
        const message = getErrorMessage(err)
        console.error("Error fetching tags:", message)
        if (mounted) setTagsError(message)
      } finally {
        if (mounted) setTagsLoading(false)
      }
    }

    fetchTags()

    return () => { mounted = false }
  }, [])

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
        initializeAutocomplete()
      }
      document.head.appendChild(script)
    }

    const initializeAutocomplete = () => {
      if (autocompleteRef.current && window.google) {
        // Access `window.google.maps.places.Autocomplete` via a narrowed window type to avoid `any`
        const win = window as unknown as {
          google?: {
            maps?: {
              places?: {
                Autocomplete?: new (input: HTMLInputElement | null, opts: unknown) => AutocompleteInstance
              }
            }
          }
        }

        const AutocompleteCtor = win.google?.maps?.places?.Autocomplete
        if (AutocompleteCtor && autocompleteRef.current) {
          autocompleteInstance.current = new AutocompleteCtor(autocompleteRef.current, {
            types: ["establishment"],
            fields: ["name", "formatted_address", "address_components", "formatted_phone_number", "website", "geometry"],
          })

          // addListener exists on the Autocomplete instance
          autocompleteInstance.current.addListener("place_changed", handlePlaceSelect)
        }
      }
    }

    loadGoogleMaps()

    return () => {
      if (autocompleteInstance.current) {
        const win = window as unknown as {
          google?: {
            maps?: {
              event?: {
                clearInstanceListeners?: (instance: unknown) => void
              }
            }
          }
        }
        win.google?.maps?.event?.clearInstanceListeners?.(autocompleteInstance.current)
      }
    }
  }, [])

  const handlePlaceSelect = () => {
    if (!autocompleteInstance.current) return

    const place = autocompleteInstance.current.getPlace() as unknown

    // Define the minimal shape we expect from Google Places for our use
    type PlaceShape = {
      address_components?: Array<{ types: string[]; long_name?: string; short_name?: string }>
      geometry?: { location?: { lat: () => number; lng: () => number } }
      name?: string
      formatted_phone_number?: string
      website?: string
      formatted_address?: string
    }

    const placeObj = place as PlaceShape | null

    if (placeObj && placeObj.address_components) {
      const addressComponents = placeObj.address_components

      let streetNumber = ""
      let route = ""
      let city = ""
      let state = ""
      let postalCode = ""

      addressComponents.forEach((component: { types: string[]; long_name?: string; short_name?: string }) => {
        const types = component.types

        if (types.includes("street_number") && component.long_name) {
          streetNumber = component.long_name
        }
        if (types.includes("route") && component.long_name) {
          route = component.long_name
        }
        if (types.includes("locality") && component.long_name) {
          city = component.long_name
        }
        if (types.includes("administrative_area_level_1") && component.short_name) {
          state = component.short_name
        }
        if (types.includes("postal_code") && component.long_name) {
          postalCode = component.long_name
        }
      })

      // Extract latitude and longitude from geometry
      let latitude = null
      let longitude = null
      if (placeObj.geometry && placeObj.geometry.location && typeof placeObj.geometry.location.lat === "function") {
        latitude = placeObj.geometry.location.lat()
      }
      if (placeObj.geometry && placeObj.geometry.location && typeof placeObj.geometry.location.lng === "function") {
        longitude = placeObj.geometry.location.lng()
      }

      setBusinessInfo({
        name: placeObj.name || "",
        streetAddress: `${streetNumber} ${route}`.trim(),
        city: city,
        state: state,
        postalCode: postalCode,
        phone: placeObj.formatted_phone_number || "",
        website: placeObj.website || "",
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
    
    // Clear server errors when user makes changes to critical fields
    if (['name', 'streetAddress', 'city', 'state', 'postalCode'].includes(field) && serverError) {
      setServerError(null)
    }
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
      tags: prev.tags.filter(tag => {
        if (tag.id !== undefined && tagToRemove.id !== undefined) {
          return String(tag.id) !== String(tagToRemove.id)
        }
        return !(tag.name === tagToRemove.name && tag.category === tagToRemove.category)
      })
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
    barHours.forEach((hours) => {
      if (!hours.isClosed) {
        if (!hours.openTime) {
          errors.barHours![`${hours.dayOfWeek}_openTime`] = "Open time is required"
          isValid = false
        }
        if (!hours.closeTime) {
          errors.barHours![`${hours.dayOfWeek}_closeTime`] = "Close time is required"
          isValid = false
        }
      }
    })

    setValidationErrors(errors)
    return isValid
  }

  const formatTimeHHMMSS = (t: string) => {
    if (!t) return t
    // If already has seconds
    if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t
    if (/^\d{2}:\d{2}$/.test(t)) return `${t}:00`
    return t
  }

  const dedupeBarHours = (hoursArr: BarHours[]) => {
    const seen = new Set<number>()
    const result: BarHours[] = []
    
    // Preserve original order while deduplicating
    for (const h of hoursArr) {
      if (!seen.has(h.dayOfWeek)) {
        seen.add(h.dayOfWeek)
        result.push(h)
      }
    }
    return result
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setServerError(null)

    if (!validateForm()) {
      return
    }

    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const dedupedHours = dedupeBarHours(barHours)

      // Build payload matching the sample shape you provided.
      // Assumptions: description, instagram, facebook are not collected in the form so we send sensible defaults.
      const payload = {
        name: businessInfo.name,
        description: "", // no description field in the current form
        address_street: businessInfo.streetAddress,
        address_city: businessInfo.city,
        address_state: businessInfo.state,
        address_zip: businessInfo.postalCode,
        latitude: businessInfo.latitude,
        longitude: businessInfo.longitude,
        phone: businessInfo.phone,
        website: businessInfo.website,
        instagram: null,
        facebook: null,
        is_active: true,
        hours: dedupedHours.map(h => ({
          day_of_week: h.dayOfWeek,
          open_time: h.isClosed ? null : formatTimeHHMMSS(h.openTime),
          close_time: h.isClosed ? null : formatTimeHHMMSS(h.closeTime),
          is_closed: h.isClosed,
        })),
        tag_ids: businessInfo.tags
          .map(t => (t.id !== undefined ? String(t.id) : t.name))
          .filter(Boolean),
      }

      const res = await api.post(BARS_ENDPOINT, payload, { requireAuth: true })

      if (!res.ok) {
        let errBody: unknown = null
        try {
          errBody = await res.json()
        } catch {
          // ignore
        }

        let message = `Server returned ${res.status} ${res.statusText}`
        let isDuplicate = false

        if (errBody && typeof errBody === 'object') {
          const obj = errBody as Record<string, unknown>
          if (typeof obj.error === 'string') {
            message = obj.error
            // Check if this is a duplicate bar error (409 Conflict)
            if (res.status === 409) {
              isDuplicate = true
            }
          }
          if (obj.validationErrors && typeof obj.validationErrors === 'object') {
            setValidationErrors((prev) => ({ ...prev, ...(obj.validationErrors as ValidationErrors) }))
          }
        }

        setServerError(message)
        
        // Show different toast messages for duplicate vs other errors
        if (isDuplicate) {
          toast.error("Duplicate Business Detected", {
            description: "A business with this name and address already exists.",
            duration: Infinity,
          })
        } else {
          toast.error("Failed to add business", {
            description: message,
            duration: Infinity,
          })
        }
        
        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      // Success
      toast.success("Business added successfully!", {
        description: "Your business has been registered and is now live.",
        duration: 4000,
      })
      
      // Reset form to initial state - create fresh instances
      setBusinessInfo(createInitialBusinessInfo())
      setBarHours(createInitialBarHours())
      setValidationErrors({})
      setFormResetKey(prev => prev + 1) // Force BarHoursCard to remount
      setServerError(null)
      
      // Clear the autocomplete search input
      if (autocompleteRef.current) {
        autocompleteRef.current.value = ''
      }
      
      // Scroll to top of the page
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err)
      setServerError(errorMessage)
      toast.error("Unexpected error occurred", {
        description: errorMessage,
        duration: Infinity,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
      <div className="min-h-screen bg-background py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Business Registration</h1>
          <p className="text-foreground/80 mt-2 text-[var(--light-gray)]">Create your business account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <BusinessInfoCard
            businessInfo={businessInfo}
            validationErrors={validationErrors}
            onChange={handleBusinessInfoChange}
            autocompleteRef={autocompleteRef}
            US_STATES={US_STATES}
          />

          <TagsCard
            selectedTags={businessInfo.tags}
            availableTags={availableTags}
            tagsLoading={tagsLoading}
            tagsError={tagsError}
            onAdd={handleTagAdd}
            onRemove={handleTagRemove}
          />

          <BarHoursCard
            key={formResetKey}
            days={DAYS_OF_WEEK}
            barHours={barHours}
            onChange={handleBarHoursChange}
            validationErrors={validationErrors.barHours}
            preserveUserOrder={true}
          />

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="lg" 
              className="px-8 bg-accent hover:bg-accent/90 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Add Business'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
