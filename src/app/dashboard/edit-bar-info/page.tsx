"use client"

import React, { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import { Toaster } from "sonner"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/ui/search-bar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"

interface SearchResult {
  id: string | number
  name: string
  address_street?: string
  address_city?: string
  address_state?: string
}

interface SearchResponse {
  results: SearchResult[]
  total: number
  limit: number
  offset: number
}

interface BarInfo {
  name: string
  description: string
  address_street: string
  address_city: string
  address_state: string
  address_zip: string
  latitude: string
  longitude: string
  phone: string
  website: string
  instagram: string
  facebook: string
}

interface ValidationErrors {
  [key: string]: string
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

const createInitialBarInfo = (): BarInfo => ({
  name: "",
  description: "",
  address_street: "",
  address_city: "",
  address_state: "",
  address_zip: "",
  latitude: "",
  longitude: "",
  phone: "",
  website: "",
  instagram: "",
  facebook: "",
})

export default function EditBarInfoPage() {
  const [barInfo, setBarInfo] = useState<BarInfo>(createInitialBarInfo())
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [selectedBusiness, setSelectedBusiness] = useState<SearchResult | null>(null)
  const [isLoadingBarInfo, setIsLoadingBarInfo] = useState<boolean>(false)

  const fetchBarInfo = useCallback(async (barId: string | number) => {
    console.log("=== Starting fetchBarInfo ===", { barId })
    setIsLoadingBarInfo(true)
    try {
      console.log("Making API request to:", `/api/bars/${barId}`)
      const response = await api.get(`/api/bars/${barId}`, { requireAuth: true })
      console.log("API response status:", response.status, "ok:", response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log("Raw API response data:", data)
        
        // Handle different API response formats
        let barData = data
        if (data.success && data.data) {
          barData = data.data
        }
        
        console.log("Processed bar data:", barData)
        
        // Populate form fields with bar information
        setBarInfo({
          name: barData.name || "",
          description: barData.description || "",
          address_street: barData.address_street || "",
          address_city: barData.address_city || "",
          address_state: barData.address_state || "",
          address_zip: barData.address_zip || "",
          latitude: barData.latitude ? String(barData.latitude) : "",
          longitude: barData.longitude ? String(barData.longitude) : "",
          phone: barData.phone || "",
          website: barData.website || "",
          instagram: barData.instagram || "",
          facebook: barData.facebook || "",
        })
      } else {
        console.error("API request failed:", response.status, response.statusText)
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to fetch bar information")
      }
    } catch (error) {
      console.error("Error fetching bar info:", error)
      toast.error("Failed to load bar information", {
        description: error instanceof Error ? error.message : "Please try again later."
      })
    } finally {
      setIsLoadingBarInfo(false)
    }
  }, [])

  const handleBarInfoChange = (field: keyof BarInfo, value: string) => {
    setBarInfo((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}
    let isValid = true

    if (!barInfo.name.trim()) {
      errors.name = "Business name is required"
      isValid = false
    }

    if (!barInfo.address_street.trim()) {
      errors.address_street = "Street address is required"
      isValid = false
    }

    if (!barInfo.address_city.trim()) {
      errors.address_city = "City is required"
      isValid = false
    }

    if (!barInfo.address_state.trim()) {
      errors.address_state = "State is required"
      isValid = false
    }

    if (!barInfo.address_zip.trim()) {
      errors.address_zip = "ZIP code is required"
      isValid = false
    }

    setValidationErrors(errors)
    return isValid
  }

  const handleSubmit = async () => {
    if (!validateForm() || !selectedBusiness) {
      if (!selectedBusiness) {
        toast.error("Please select a business first")
      }
      return
    }

    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const payload = {
        name: barInfo.name,
        description: barInfo.description || null,
        address_street: barInfo.address_street,
        address_city: barInfo.address_city,
        address_state: barInfo.address_state,
        address_zip: barInfo.address_zip,
        latitude: barInfo.latitude || null,
        longitude: barInfo.longitude || null,
        phone: barInfo.phone || null,
        website: barInfo.website || null,
        instagram: barInfo.instagram || null,
        facebook: barInfo.facebook || null,
      }

      const response = await api.put(`/api/bars/${selectedBusiness.id}`, payload, { requireAuth: true })

      if (response.ok) {
        toast.success("Bar information updated successfully!", {
          description: `Information for ${selectedBusiness.name} has been saved.`
        })
        
        // Reset form state after a short delay
        setTimeout(() => {
          setSelectedBusiness(null)
          setSearchQuery("")
          setBarInfo(createInitialBarInfo())
          setValidationErrors({})
        }, 1500)
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to update bar information")
      }
    } catch (error) {
      console.error("Error updating bar info:", error)
      toast.error("Failed to update bar information", {
        description: error instanceof Error ? error.message : "Please try again later."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    try {
      const searchUrl = `/api/bars/search?q=${encodeURIComponent(query)}&limit=10`
      const response = await api.get(searchUrl, { requireAuth: true })

      if (response.ok) {
        const data = await response.json() as SearchResponse
        setSearchResults(data.results || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        let errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`
        
        if (response.status === 404) {
          errorMessage = "The bar search API endpoint was not found."
        } else if (response.status === 401) {
          errorMessage = "Authentication failed. Please check your login credentials."
        } else if (response.status === 500) {
          errorMessage = "Server error occurred. The API may be unavailable."
        }
        
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Auto-search as user types (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // If user has changed the search query from the selected business name, clear selection
      if (selectedBusiness && searchQuery !== selectedBusiness.name) {
        setSelectedBusiness(null)
        setBarInfo(createInitialBarInfo()) // Reset to default info
      }
      
      // Don't auto-search if a business is already selected and the query matches the selected business name
      if (selectedBusiness && searchQuery === selectedBusiness.name) {
        setSearchResults([]) // Clear any existing results
        return
      }
      
      if (searchQuery.trim().length >= 2) {
        handleSearch(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, handleSearch, selectedBusiness])

  const handleClearSearch = useCallback(() => {
    setSearchResults([])
    setSelectedBusiness(null)
    setSearchQuery("")
    // Reset to default info when clearing
    setBarInfo(createInitialBarInfo())
  }, [])

  const handleSelectBusiness = useCallback(async (business: SearchResult) => {
    console.log("=== Selecting business ===", business)
    // Clear results immediately to close dropdown
    setSearchResults([])
    
    // Set selected business and update search query
    setSelectedBusiness(business)
    setSearchQuery(business.name)
    console.log("Selected business state updated, fetching bar info...")
    
    // Fetch and populate bar information
    await fetchBarInfo(business.id)
  }, [fetchBarInfo])

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <Toaster position="top-right" richColors expand />
      
      <div className="mx-auto max-w-2xl">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          onClear={handleClearSearch}
          onResultSelect={handleSelectBusiness}
          placeholder="Search for bars and restaurants..."
          size="lg"
          className="w-full mb-6"
          disabled={isSearching}
          results={searchResults}
          isLoading={isSearching}
          showDropdown={true}
        />
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            {selectedBusiness ? `Edit Information for ${selectedBusiness.name}` : 'Edit Bar Information'}
          </h1>
          <p className="text-white mt-2">
            {isLoadingBarInfo 
              ? `Loading information for ${selectedBusiness?.name}...`
              : selectedBusiness 
                ? `Update information for ${selectedBusiness.name}`
                : 'Search for a business and update its information'
            }
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border-border-light bg-white">
            <CardHeader>
              <CardTitle className="text-foreground text-[var(--dark-sapphire)]">
                Bar Information
              </CardTitle>
              <CardDescription className="text-foreground/80 text-[var(--charcoal-gray)]">
                Update the business information below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground text-[var(--dark-sapphire)]">
                  Business Name *
                </Label>
                <Input
                  id="name"
                  value={barInfo.name}
                  onChange={(e) => handleBarInfoChange("name", e.target.value)}
                  placeholder="Enter business name"
                  required
                  className={`bg-background border-border-light text-foreground text-[var(--dark-sapphire)] ${
                    validationErrors.name ? "border-red-500" : ""
                  }`}
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground text-[var(--dark-sapphire)]">
                  Description
                </Label>
                <textarea
                  id="description"
                  value={barInfo.description}
                  onChange={(e) => handleBarInfoChange("description", e.target.value)}
                  placeholder="Enter business description"
                  rows={4}
                  className={`w-full px-3 py-2 bg-background border border-border-light rounded-md text-foreground text-[var(--dark-sapphire)] focus:outline-none focus:ring-2 focus:ring-accent ${
                    validationErrors.description ? "border-red-500" : ""
                  }`}
                />
                {validationErrors.description && (
                  <p className="text-sm text-red-600">{validationErrors.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_street" className="text-foreground text-[var(--dark-sapphire)]">
                  Street Address *
                </Label>
                <Input
                  id="address_street"
                  value={barInfo.address_street}
                  onChange={(e) => handleBarInfoChange("address_street", e.target.value)}
                  placeholder="Enter street address"
                  required
                  className={`bg-background border-border-light text-foreground text-[var(--dark-sapphire)] ${
                    validationErrors.address_street ? "border-red-500" : ""
                  }`}
                />
                {validationErrors.address_street && (
                  <p className="text-sm text-red-600">{validationErrors.address_street}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address_city" className="text-foreground text-[var(--dark-sapphire)]">
                    City *
                  </Label>
                  <Input
                    id="address_city"
                    value={barInfo.address_city}
                    onChange={(e) => handleBarInfoChange("address_city", e.target.value)}
                    placeholder="Enter city"
                    required
                    className={`bg-background border-border-light text-foreground text-[var(--dark-sapphire)] ${
                      validationErrors.address_city ? "border-red-500" : ""
                    }`}
                  />
                  {validationErrors.address_city && (
                    <p className="text-sm text-red-600">{validationErrors.address_city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_state" className="text-foreground text-[var(--dark-sapphire)]">
                    State *
                  </Label>
                  <select
                    id="address_state"
                    value={barInfo.address_state}
                    onChange={(e) => handleBarInfoChange("address_state", e.target.value)}
                    required
                    className={`w-full h-10 px-3 py-2 bg-background border border-border-light rounded-md text-foreground text-[var(--dark-sapphire)] focus:outline-none focus:ring-2 focus:ring-accent ${
                      validationErrors.address_state ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Select a state</option>
                    {US_STATES.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                  {validationErrors.address_state && (
                    <p className="text-sm text-red-600">{validationErrors.address_state}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_zip" className="text-foreground text-[var(--dark-sapphire)]">
                  ZIP Code *
                </Label>
                <Input
                  id="address_zip"
                  value={barInfo.address_zip}
                  onChange={(e) => handleBarInfoChange("address_zip", e.target.value)}
                  placeholder="Enter ZIP code"
                  required
                  className={`bg-background border-border-light text-foreground text-[var(--dark-sapphire)] ${
                    validationErrors.address_zip ? "border-red-500" : ""
                  }`}
                />
                {validationErrors.address_zip && (
                  <p className="text-sm text-red-600">{validationErrors.address_zip}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude" className="text-foreground text-[var(--dark-sapphire)]">
                    Latitude
                  </Label>
                  <Input
                    id="latitude"
                    type="text"
                    value={barInfo.latitude}
                    onChange={(e) => handleBarInfoChange("latitude", e.target.value)}
                    placeholder="Enter latitude"
                    className="bg-background border-border-light text-foreground text-[var(--dark-sapphire)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude" className="text-foreground text-[var(--dark-sapphire)]">
                    Longitude
                  </Label>
                  <Input
                    id="longitude"
                    type="text"
                    value={barInfo.longitude}
                    onChange={(e) => handleBarInfoChange("longitude", e.target.value)}
                    placeholder="Enter longitude"
                    className="bg-background border-border-light text-foreground text-[var(--dark-sapphire)]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground text-[var(--dark-sapphire)]">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={barInfo.phone}
                  onChange={(e) => handleBarInfoChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                  className="bg-background border-border-light text-foreground text-[var(--dark-sapphire)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-foreground text-[var(--dark-sapphire)]">
                  Website
                </Label>
                <Input
                  id="website"
                  type="text"
                  value={barInfo.website}
                  onChange={(e) => handleBarInfoChange("website", e.target.value)}
                  placeholder="https://www.example.com"
                  className="bg-background border-border-light text-foreground text-[var(--dark-sapphire)]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="text-foreground text-[var(--dark-sapphire)]">
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    type="text"
                    value={barInfo.instagram}
                    onChange={(e) => handleBarInfoChange("instagram", e.target.value)}
                    placeholder="Instagram handle or URL"
                    className="bg-background border-border-light text-foreground text-[var(--dark-sapphire)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook" className="text-foreground text-[var(--dark-sapphire)]">
                    Facebook
                  </Label>
                  <Input
                    id="facebook"
                    type="text"
                    value={barInfo.facebook}
                    onChange={(e) => handleBarInfoChange("facebook", e.target.value)}
                    placeholder="Facebook URL"
                    className="bg-background border-border-light text-foreground text-[var(--dark-sapphire)]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="ghost"
                disabled={isSubmitting}
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedBusiness}
                className="px-8 py-2 bg-accent hover:bg-accent/90 text-white"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

