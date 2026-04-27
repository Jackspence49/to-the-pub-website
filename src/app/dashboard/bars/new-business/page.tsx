"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import BusinessInfoCard from "@/components/cards/BusinessInfoCard"
import BarTagsCard from "@/components/cards/BarTagsCard"
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
  category: string
  description?: string
}

interface BusinessInfo {
  name: string
  streetAddress: string
  city: string
  state: string
  postalCode: string
  phone: string
  description: string
  website: string
  instagram: string
  facebook: string
  twitter: string
  posh: string
  eventbrite: string
  latitude: number | null
  longitude: number | null
  tags: Tag[]
}

interface BarHours {
  dayOfWeek: number
  openTime: string
  closeTime: string
  isClosed: boolean
}

interface DayInfo {
  id: number
  name: string
  shortName: string
}

type SocialLinkField = "instagram" | "facebook" | "twitter" | "posh" | "eventbrite"

const SOCIAL_LINK_FIELDS: SocialLinkField[] = ["instagram", "facebook", "twitter", "posh", "eventbrite"]

const SOCIAL_LINK_LABELS: Record<SocialLinkField, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "Twitter",
  posh: "POSH",
  eventbrite: "Eventbrite",
}

interface ValidationErrors {
  business?: { [key: string]: string }
  barHours?: { [key: string]: string }
}

const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return true
  return /^\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})$/.test(phone)
}

const validateWebsite = (website: string): boolean => {
  if (!website) return true
  const websiteRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9][a-zA-Z0-9-]*)*\.[a-zA-Z]{2,}(\/[^\s]*)?$/
  return websiteRegex.test(website.trim())
}

const validatePostalCode = (postalCode: string): boolean =>
  /^\d{5}(?:[-\s]\d{4})?$/.test(postalCode)

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message
  try { return String(err) } catch { return "Unknown error" }
}

const US_STATES = [
  { value: "AL", label: "Alabama" }, { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" }, { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" }, { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" }, { value: "DE", label: "Delaware" },
  { value: "DC", label: "District of Columbia" }, { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" }, { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" }, { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" }, { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" }, { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" }, { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" }, { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" }, { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" }, { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" }, { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" }, { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" }, { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" }, { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" }, { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" }, { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" }, { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" }, { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" }, { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" }, { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" }, { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" }, { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
]

const DAYS_OF_WEEK: DayInfo[] = [
  { id: 0, name: "Sunday", shortName: "Sun" },
  { id: 1, name: "Monday", shortName: "Mon" },
  { id: 2, name: "Tuesday", shortName: "Tue" },
  { id: 3, name: "Wednesday", shortName: "Wed" },
  { id: 4, name: "Thursday", shortName: "Thu" },
  { id: 5, name: "Friday", shortName: "Fri" },
  { id: 6, name: "Saturday", shortName: "Sat" },
]

const createInitialBusinessInfo = (): BusinessInfo => ({
  name: "", streetAddress: "", city: "", state: "", postalCode: "",
  phone: "", description: "", website: "", instagram: "", facebook: "", twitter: "",
  posh: "", eventbrite: "", latitude: null, longitude: null, tags: [],
})

const createInitialBarHours = (): BarHours[] =>
  DAYS_OF_WEEK.map(day => ({ dayOfWeek: day.id, openTime: "09:00", closeTime: "22:00", isClosed: false }))

export default function NewBusinessPage() {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(createInitialBusinessInfo)
  const [placeSelected, setPlaceSelected] = useState(false)
  const [barHours, setBarHours] = useState<BarHours[]>(createInitialBarHours)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [tagsLoading, setTagsLoading] = useState(false)
  const [tagsError, setTagsError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [formResetKey, setFormResetKey] = useState(0)

  const autocompleteRef = useRef<HTMLInputElement>(null)
  type AutocompleteInstance = {
    addListener: (eventName: string, handler: () => void) => void
    getPlace: () => unknown
  }
  const autocompleteInstance = useRef<AutocompleteInstance | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchTags = async () => {
      setTagsLoading(true)
      setTagsError(null)
      try {
        const data = await api.get("/api/barTags").then(res => res.json())
        let tags: Tag[] = []
        if (Array.isArray(data)) tags = data
        else if (Array.isArray(data.tags)) tags = data.tags
        else if (Array.isArray(data.data)) tags = data.data
        if (mounted) setAvailableTags(tags)
      } catch (err: unknown) {
        if (mounted) setTagsError(getErrorMessage(err))
      } finally {
        if (mounted) setTagsLoading(false)
      }
    }
    fetchTags()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const initializeAutocomplete = () => {
      const win = window as unknown as {
        google?: { maps?: { places?: { Autocomplete?: new (input: HTMLInputElement | null, opts: unknown) => AutocompleteInstance } } }
      }
      const AutocompleteCtor = win.google?.maps?.places?.Autocomplete
      if (AutocompleteCtor && autocompleteRef.current) {
        autocompleteInstance.current = new AutocompleteCtor(autocompleteRef.current, {
          types: ["establishment"],
          fields: ["name", "address_components", "formatted_phone_number", "website", "geometry"],
        })
        autocompleteInstance.current.addListener("place_changed", handlePlaceSelect)
      }
    }

    if (window.google) {
      initializeAutocomplete()
      return
    }
    if (document.querySelector('script[src*="maps.googleapis.com"]')) return

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = initializeAutocomplete
    document.head.appendChild(script)

    return () => {
      if (autocompleteInstance.current) {
        const win = window as unknown as { google?: { maps?: { event?: { clearInstanceListeners?: (i: unknown) => void } } } }
        win.google?.maps?.event?.clearInstanceListeners?.(autocompleteInstance.current)
      }
    }
  }, [])

  const handlePlaceSelect = () => {
    if (!autocompleteInstance.current) return
    type PlaceShape = {
      address_components?: Array<{ types: string[]; long_name?: string; short_name?: string }>
      geometry?: { location?: { lat: () => number; lng: () => number } }
      name?: string
      formatted_phone_number?: string
      website?: string
    }
    const place = autocompleteInstance.current.getPlace() as PlaceShape | null
    if (!place?.address_components) return

    let streetNumber = "", route = "", city = "", state = "", postalCode = ""
    place.address_components.forEach(c => {
      if (c.types.includes("street_number") && c.long_name) streetNumber = c.long_name
      if (c.types.includes("route") && c.long_name) route = c.long_name
      if (c.types.includes("locality") && c.long_name) city = c.long_name
      // Fallback to postal_town (common in UK/non-US results)
      if (!city && c.types.includes("postal_town") && c.long_name) city = c.long_name
      if (c.types.includes("administrative_area_level_1") && c.short_name) state = c.short_name
      if (c.types.includes("postal_code") && c.long_name) postalCode = c.long_name
    })

    const lat = typeof place.geometry?.location?.lat === "function" ? place.geometry.location.lat() : null
    const lng = typeof place.geometry?.location?.lng === "function" ? place.geometry.location.lng() : null

    setBusinessInfo(prev => ({
      ...prev,
      name: place.name || "",
      streetAddress: `${streetNumber} ${route}`.trim(),
      city, state, postalCode,
      phone: place.formatted_phone_number || "",
      website: place.website || "",
      latitude: lat,
      longitude: lng,
      tags: [],
    }))
    setPlaceSelected(true)
  }

  const handleClearPlace = () => {
    setBusinessInfo(createInitialBusinessInfo())
    setPlaceSelected(false)
    setValidationErrors({})
    setServerError(null)
    if (autocompleteRef.current) autocompleteRef.current.value = ""
  }

  const handleBusinessInfoChange = (field: keyof BusinessInfo, value: string) => {
    setBusinessInfo(prev => ({ ...prev, [field]: value }))
    if (['name', 'streetAddress', 'city', 'state', 'postalCode'].includes(field) && serverError) {
      setServerError(null)
    }
  }

  const handleBarHoursChange = (dayOfWeek: number, field: keyof BarHours, value: string | boolean) => {
    setBarHours(prev => prev.map(h => h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h))
  }

  const handleTagAdd = (tag: Tag) =>
    setBusinessInfo(prev => ({ ...prev, tags: [...prev.tags, tag] }))

  const handleTagRemove = (tagToRemove: Tag) =>
    setBusinessInfo(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => {
        if (tag.id !== undefined && tagToRemove.id !== undefined) return String(tag.id) !== String(tagToRemove.id)
        return !(tag.name === tagToRemove.name && tag.category === tagToRemove.category)
      })
    }))

  const validateForm = (): boolean => {
    const errors: ValidationErrors = { business: {}, barHours: {} }
    let isValid = true

    if (!businessInfo.name.trim()) { errors.business!.name = "Business name is required"; isValid = false }
    if (!businessInfo.streetAddress.trim()) { errors.business!.streetAddress = "Street address is required"; isValid = false }
    if (!businessInfo.city.trim()) { errors.business!.city = "City is required"; isValid = false }
    if (!businessInfo.state.trim()) { errors.business!.state = "State is required"; isValid = false }

    // Give a specific message when Google omitted the postal code
    if (!businessInfo.postalCode.trim()) {
      errors.business!.postalCode = placeSelected
        ? "Google didn't return a postal code — please add it"
        : "ZIP code is required"
      isValid = false
    } else if (!validatePostalCode(businessInfo.postalCode)) {
      errors.business!.postalCode = "Invalid ZIP code format"
      isValid = false
    }

    if (businessInfo.phone && !validatePhoneNumber(businessInfo.phone)) {
      errors.business!.phone = "Invalid phone number format"; isValid = false
    }
    if (businessInfo.website && !validateWebsite(businessInfo.website)) {
      errors.business!.website = "Invalid website URL format"; isValid = false
    }

    SOCIAL_LINK_FIELDS.forEach(field => {
      if (businessInfo[field] && !validateWebsite(businessInfo[field])) {
        errors.business![field] = `Invalid ${SOCIAL_LINK_LABELS[field]} URL format`
        isValid = false
      }
    })

    barHours.forEach(h => {
      if (!h.isClosed) {
        if (!h.openTime) { errors.barHours![`${h.dayOfWeek}_openTime`] = "Open time is required"; isValid = false }
        if (!h.closeTime) { errors.barHours![`${h.dayOfWeek}_closeTime`] = "Close time is required"; isValid = false }
      }
    })

    setValidationErrors(errors)
    return isValid
  }

  const formatTime = (t: string) => {
    if (!t) return t
    if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t
    if (/^\d{2}:\d{2}$/.test(t)) return `${t}:00`
    return t
  }

  const dedupeBarHours = (arr: BarHours[]) => {
    const seen = new Set<number>()
    return arr.filter(h => { if (seen.has(h.dayOfWeek)) return false; seen.add(h.dayOfWeek); return true })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)
    if (!validateForm() || isSubmitting) return

    // Defensive lat/lng range guard (user can't edit these, but assert before sending)
    if (businessInfo.latitude !== null && (businessInfo.latitude < -90 || businessInfo.latitude > 90)) {
      toast.error("Invalid coordinates", { description: "Latitude out of range.", duration: Infinity })
      return
    }
    if (businessInfo.longitude !== null && (businessInfo.longitude < -180 || businessInfo.longitude > 180)) {
      toast.error("Invalid coordinates", { description: "Longitude out of range.", duration: Infinity })
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        name: businessInfo.name,
        address_street: businessInfo.streetAddress,
        address_city: businessInfo.city,
        address_state: businessInfo.state,
        address_zip: businessInfo.postalCode,
        latitude: businessInfo.latitude,
        longitude: businessInfo.longitude,
        phone: businessInfo.phone || null,
        description: businessInfo.description || null,
        website: businessInfo.website || null,
        instagram: businessInfo.instagram || null,
        facebook: businessInfo.facebook || null,
        twitter: businessInfo.twitter || null,
        posh: businessInfo.posh || null,
        eventbrite: businessInfo.eventbrite || null,
        hours: dedupeBarHours(barHours).map(h => ({
          day_of_week: h.dayOfWeek,
          is_closed: h.isClosed,
          open_time: h.isClosed ? null : formatTime(h.openTime),
          close_time: h.isClosed ? null : formatTime(h.closeTime),
        })),
        tag_ids: businessInfo.tags.map(t => (t.id !== undefined ? String(t.id) : t.name)).filter(Boolean),
      }

      const res = await api.post("/api/bars", payload, { requireAuth: true })

      if (!res.ok) {
        let errBody: unknown = null
        try { errBody = await res.json() } catch { /* ignore */ }

        let message = `Server returned ${res.status} ${res.statusText}`
        if (errBody && typeof errBody === 'object') {
          const obj = errBody as Record<string, unknown>
          if (typeof obj.error === 'string') message = obj.error
          if (obj.validationErrors && typeof obj.validationErrors === 'object') {
            setValidationErrors(prev => ({ ...prev, ...(obj.validationErrors as ValidationErrors) }))
          }
        }

        setServerError(message)
        toast.error(res.status === 409 ? "Duplicate Business Detected" : "Failed to add business", {
          description: res.status === 409 ? "A business with this name and address already exists." : message,
          duration: Infinity,
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      toast.success("Business added successfully!", { duration: 4000 })
      setBusinessInfo(createInitialBusinessInfo())
      setPlaceSelected(false)
      setBarHours(createInitialBarHours())
      setValidationErrors({})
      setFormResetKey(prev => prev + 1)
      setServerError(null)
      if (autocompleteRef.current) autocompleteRef.current.value = ""
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: unknown) {
      const msg = getErrorMessage(err)
      setServerError(msg)
      toast.error("Unexpected error occurred", { description: msg, duration: Infinity })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--dark-sapphire,#1A2B3C)]">Add New Bar</h1>
        <p className="mt-1 text-sm text-slate-500">Admin only · POST /bars</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <BusinessInfoCard
          key={formResetKey}
          businessInfo={businessInfo}
          validationErrors={validationErrors}
          onChange={handleBusinessInfoChange}
          autocompleteRef={autocompleteRef}
          US_STATES={US_STATES}
          placeSelected={placeSelected}
          onClearPlace={handleClearPlace}
        />

        {(placeSelected || validationErrors.business) && (
          <>
            <BarTagsCard
              selectedTags={businessInfo.tags}
              availableTags={availableTags}
              tagsLoading={tagsLoading}
              tagsError={tagsError}
              onAdd={handleTagAdd}
              onRemove={handleTagRemove}
            />

            <BarHoursCard
              key={`hours-${formResetKey}`}
              days={DAYS_OF_WEEK}
              barHours={barHours}
              onChange={handleBarHoursChange}
              validationErrors={validationErrors.barHours}
              preserveUserOrder={true}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-accent px-8 font-semibold text-white hover:bg-accent/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting…" : "Add Business"}
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
