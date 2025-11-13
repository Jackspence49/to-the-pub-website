"use client"

import React, { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/ui/search-bar"
import { Badge } from "@/components/ui/badge"
import BarHoursCard from "@/components/cards/BarHoursCard"
import { api } from "@/lib/api"

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
  [key: string]: string
}

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

const DAYS_OF_WEEK: DayInfo[] = [
  { id: 0, name: "Sunday", shortName: "Sun" },
  { id: 1, name: "Monday", shortName: "Mon" },
  { id: 2, name: "Tuesday", shortName: "Tue" },
  { id: 3, name: "Wednesday", shortName: "Wed" },
  { id: 4, name: "Thursday", shortName: "Thu" },
  { id: 5, name: "Friday", shortName: "Fri" },
  { id: 6, name: "Saturday", shortName: "Sat" }
]

// Helper function to create initial bar hours
const createInitialBarHours = (): BarHours[] => DAYS_OF_WEEK.map(day => ({
  dayOfWeek: day.id,
  openTime: "09:00",
  closeTime: "22:00",
  isClosed: false
}))

export default function EditHoursPage() {
  const [barHours, setBarHours] = useState<BarHours[]>(createInitialBarHours())
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [selectedBusiness, setSelectedBusiness] = useState<SearchResult | null>(null)
  const [isLoadingHours, setIsLoadingHours] = useState<boolean>(false)
  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false)

  const formatTime = (time: string | null | undefined): string => {
    if (!time) return "09:00"
    
    const timeStr = String(time).trim()
    if (!timeStr) return "09:00"
    
    // Handle 24:00 as 00:00 for HTML time input
    if (timeStr.startsWith("24:")) return "00:00"
    
    // If time includes colon, remove seconds if present (HH:MM:SS -> HH:MM)
    if (timeStr.includes(':')) {
      const timeParts = timeStr.split(':')
      if (timeParts.length >= 2) {
        const hours = timeParts[0].padStart(2, '0')
        const minutes = timeParts[1].padStart(2, '0')
        return `${hours}:${minutes}`
      }
    }
    
    // If no colon, assume it's just hours and add :00
    if (/^\d{1,2}$/.test(timeStr)) {
      return `${timeStr.padStart(2, '0')}:00`
    }
    
    return timeStr
  }

  const fetchBarHours = useCallback(async (barId: string | number) => {
    console.log("=== Starting fetchBarHours ===", { barId })
    setIsLoadingHours(true)
    try {
      console.log("Making API request to:", `/api/bars/${barId}/hours`)
      const response = await api.get(`/api/bars/${barId}/hours`, { requireAuth: true })
      console.log("API response status:", response.status, "ok:", response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log("Raw API response data:", data)
        
        // Handle different API response formats
        let apiHours = []
        
        if (Array.isArray(data)) {
          // Direct array format
          apiHours = data
        } else if (data.success && Array.isArray(data.data)) {
          // New format: { success: true, data: [...hours array...], meta: {...} }
          apiHours = data.data
        } else if (data.success && data.data && Array.isArray(data.data.hours)) {
          // Old format: { success: true, data: { hours: [...] } }
          apiHours = data.data.hours
        }
        
        console.log("Processed API hours:", apiHours)
        
        if (Array.isArray(apiHours) && apiHours.length > 0) {
          const convertedHours = DAYS_OF_WEEK.map(day => {
            const dayHours = apiHours.find((h: { day_of_week: number; open_time?: string; close_time?: string; is_closed?: boolean }) => h.day_of_week === day.id)
            
            console.log(`Day ${day.id} (${day.name}):`, dayHours)
            
            if (dayHours) {
              const converted = {
                dayOfWeek: day.id,
                openTime: formatTime(dayHours.open_time),
                closeTime: formatTime(dayHours.close_time),
                isClosed: dayHours.is_closed || false
              }
              console.log(`Converted for day ${day.id}:`, converted)
              return converted
            } else {
              return {
                dayOfWeek: day.id,
                openTime: "09:00",
                closeTime: "22:00",
                isClosed: false
              }
            }
          })
          
          console.log("Final converted hours:", convertedHours)
          setBarHours(convertedHours)
        } else {
          console.log("No hours found in API response or invalid format")
        }
      } else {
        console.error("API request failed:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error fetching bar hours:", error)
    } finally {
      setIsLoadingHours(false)
    }
  }, [])

  const handleBarHoursChange = (dayOfWeek: number, field: keyof BarHours, value: string | boolean) => {
    setBarHours((prev) =>
      prev.map((hours) =>
        hours.dayOfWeek === dayOfWeek
          ? { ...hours, [field]: value }
          : hours
      )
    )
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}
    let isValid = true

    // Bar Hours Validation
    barHours.forEach((hours) => {
      if (!hours.isClosed) {
        if (!hours.openTime) {
          errors[`${hours.dayOfWeek}_openTime`] = "Open time is required"
          isValid = false
        }
        if (!hours.closeTime) {
          errors[`${hours.dayOfWeek}_closeTime`] = "Close time is required"
          isValid = false
        }
      }
    })

    setValidationErrors(errors)
    return isValid
  }

  const handleSubmit = async () => {
    if (!validateForm() || !selectedBusiness) {
      return
    }

    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const formatTimeForAPI = (time: string) => {
        if (!time) return null
        return /^\d{2}:\d{2}:\d{2}$/.test(time) ? time : `${time}:00`
      }

      const payload = {
        hours: barHours.map(h => ({
          day_of_week: h.dayOfWeek,
          open_time: h.isClosed ? null : formatTimeForAPI(h.openTime),
          close_time: h.isClosed ? null : formatTimeForAPI(h.closeTime),
          is_closed: h.isClosed,
        }))
      }

      const response = await api.put(`/api/bars/${selectedBusiness.id}/hours`, payload, { requireAuth: true })

      if (response.ok) {
        setIsFormSubmitted(true)
        // Reset form state after a delay to show the submitted state
        setTimeout(() => {
          setSelectedBusiness(null)
          setSearchQuery("")
          setBarHours(createInitialBarHours())
          setValidationErrors({})
          setIsFormSubmitted(false)
        }, 3000)
      } else {
        throw new Error("Failed to update hours")
      }
    } catch (error) {
      console.error("Error updating hours:", error)
      alert("Failed to update hours. Please try again.")
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
        setBarHours(createInitialBarHours()) // Reset to default hours
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
    setIsFormSubmitted(false)
    // Reset to default hours when clearing
    setBarHours(createInitialBarHours())
  }, [])

  const handleSelectBusiness = useCallback(async (business: SearchResult) => {
    console.log("=== Selecting business ===", business)
    // Clear results immediately to close dropdown
    setSearchResults([])
    
    // Set selected business and update search query
    setSelectedBusiness(business)
    setSearchQuery(business.name)
    console.log("Selected business state updated, fetching hours...")
    
    // Fetch and populate bar hours
    await fetchBarHours(business.id)
  }, [fetchBarHours])

  // Debug: log current state
  console.log("=== Component Render ===", {
    selectedBusiness,
    isLoadingHours,
    barHours: barHours.map(h => ({ day: h.dayOfWeek, open: h.openTime, close: h.closeTime, closed: h.isClosed }))
  })

  return (
    <div className="min-h-screen bg-background py-8 px-4">
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
            {selectedBusiness ? `Edit Hours for ${selectedBusiness.name}` : 'Edit Business Hours'}
          </h1>
          <p className="text-white mt-2">
            {isLoadingHours 
              ? `Loading hours for ${selectedBusiness?.name}...`
              : selectedBusiness 
                ? `Update operating hours for ${selectedBusiness.name}`
                : 'Search for a business and update operating hours for each day of the week'
            }
          </p>
        </div>

        <div className="space-y-6">
          <BarHoursCard
            days={DAYS_OF_WEEK}
            barHours={barHours}
            onChange={handleBarHoursChange}
            validationErrors={validationErrors}
          />

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
              {isFormSubmitted ? (
                <Badge variant="default" className="px-6 py-3 text-sm bg-green-600 text-white">
                  Form Submitted ✓
                </Badge>
              ) : (
                <Button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !selectedBusiness}
                  className="px-8 py-2 bg-accent hover:bg-accent/90 text-white"
                >
                  {isSubmitting ? 'Saving...' : 'Save Hours'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
