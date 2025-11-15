"use client"

import React, { useState, useCallback, useEffect } from "react"
import { Tag as TagIcon, Loader2, Trash2, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { Toaster } from "sonner"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/ui/search-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
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

interface BarTag {
  id: string
  name: string
  category: "type" | "amenity"
  created_at?: string
}

interface AvailableTag {
  id: string | number
  name: string
  category: "type" | "amenity"
}

export default function EditBusinessTagsPage() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [selectedBusiness, setSelectedBusiness] = useState<SearchResult | null>(null)
  
  const [barTags, setBarTags] = useState<BarTag[]>([])
  const [isLoadingBarTags, setIsLoadingBarTags] = useState<boolean>(false)
  const [barTagsError, setBarTagsError] = useState<string | null>(null)
  
  const [availableTags, setAvailableTags] = useState<AvailableTag[]>([])
  const [isLoadingAvailableTags, setIsLoadingAvailableTags] = useState<boolean>(false)
  const [availableTagsError, setAvailableTagsError] = useState<string | null>(null)
  
  const [selectedTagToAdd, setSelectedTagToAdd] = useState<string>("")
  const [isAddingTag, setIsAddingTag] = useState<boolean>(false)
  const [isDeletingTag, setIsDeletingTag] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<BarTag | null>(null)

  // Handle Escape key to close delete confirmation dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDeleteConfirm && !isDeletingTag) {
        setShowDeleteConfirm(null)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [showDeleteConfirm, isDeletingTag])

  // Fetch available tags on component mount
  useEffect(() => {
    let mounted = true
    const fetchAvailableTags = async () => {
      setIsLoadingAvailableTags(true)
      setAvailableTagsError(null)
      try {
        const response = await api.get("/api/tags", { requireAuth: true })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch tags: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        // Normalize response: accept an array or an object with `tags` or `data` fields
        let tags: AvailableTag[] = []
        if (Array.isArray(data)) {
          tags = data
        } else if (Array.isArray(data.tags)) {
          tags = data.tags
        } else if (Array.isArray(data.data)) {
          tags = data.data
        }

        if (mounted) {
          setAvailableTags(tags)
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error"
        console.error("Error fetching available tags:", message)
        if (mounted) {
          setAvailableTagsError(message)
          toast.error("Failed to load available tags", {
            description: message,
            duration: 5000,
          })
        }
      } finally {
        if (mounted) setIsLoadingAvailableTags(false)
      }
    }

    fetchAvailableTags()
    return () => { mounted = false }
  }, [])

  // Fetch bar tags when a business is selected
  const fetchBarTags = useCallback(async (barId: string | number) => {
    console.log("=== Starting fetchBarTags ===", { barId })
    setIsLoadingBarTags(true)
    setBarTagsError(null)
    try {
      console.log("Making API request to:", `/api/bars/${barId}/tags`)
      const response = await api.get(`/api/bars/${barId}/tags`, { requireAuth: true })
      console.log("API response status:", response.status, "ok:", response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log("Raw API response data:", data)
        
        // Handle different API response formats
        let tagsData: BarTag[] = []
        if (Array.isArray(data)) {
          tagsData = data
        } else if (data.success && Array.isArray(data.data)) {
          tagsData = data.data
        } else if (Array.isArray(data.tags)) {
          tagsData = data.tags
        } else if (Array.isArray(data.data)) {
          tagsData = data.data
        }
        
        console.log("Processed bar tags:", tagsData)
        setBarTags(tagsData)
      } else {
        console.error("API request failed:", response.status, response.statusText)
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || "Failed to fetch bar tags")
      }
    } catch (error) {
      console.error("Error fetching bar tags:", error)
      const errorMessage = error instanceof Error ? error.message : "Please try again later."
      setBarTagsError(errorMessage)
      toast.error("Failed to load bar tags", {
        description: errorMessage
      })
    } finally {
      setIsLoadingBarTags(false)
    }
  }, [])

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
        setBarTags([])
        setBarTagsError(null)
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
    setBarTags([])
    setBarTagsError(null)
  }, [])

  const handleSelectBusiness = useCallback(async (business: SearchResult) => {
    console.log("=== Selecting business ===", business)
    // Clear results immediately to close dropdown
    setSearchResults([])
    
    // Set selected business and update search query
    setSelectedBusiness(business)
    setSearchQuery(business.name)
    console.log("Selected business state updated, fetching bar tags...")
    
    // Fetch and populate bar tags
    await fetchBarTags(business.id)
  }, [fetchBarTags])

  const handleAddTag = async () => {
    if (!selectedBusiness || !selectedTagToAdd) {
      toast.error("Please select a tag to add")
      return
    }

    // Check if tag is already added
    const tagAlreadyAdded = barTags.some(tag => String(tag.id) === selectedTagToAdd)
    if (tagAlreadyAdded) {
      toast.error("This tag is already added to the business")
      return
    }

    setIsAddingTag(true)

    try {
      const selectedTag = availableTags.find(t => String(t.id) === selectedTagToAdd)
      if (!selectedTag) {
        throw new Error("Selected tag not found")
      }

      const response = await api.post(
        `/api/bars/${selectedBusiness.id}/tags`,
        { tag_id: selectedTagToAdd },
        { requireAuth: true }
      )

      if (response.ok) {
        const data = await response.json()
        
        // Refresh bar tags
        await fetchBarTags(selectedBusiness.id)
        
        toast.success("Tag added successfully!", {
          description: `${selectedTag.name} has been added to ${selectedBusiness.name}.`,
          duration: 4000,
        })
        
        setSelectedTagToAdd("")
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || "Failed to add tag")
      }
    } catch (error) {
      console.error("Error adding tag:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to add tag"
      toast.error("Failed to add tag", {
        description: errorMessage,
        duration: 5000,
      })
    } finally {
      setIsAddingTag(false)
    }
  }

  const handleDeleteClick = (tag: BarTag) => {
    setShowDeleteConfirm(tag)
  }

  const handleDeleteConfirm = async () => {
    if (!showDeleteConfirm || !selectedBusiness) {
      return
    }

    const tagToDelete = showDeleteConfirm
    setShowDeleteConfirm(null)
    setIsDeletingTag(tagToDelete.id)

    try {
      const response = await api.delete(
        `/api/bars/${selectedBusiness.id}/tags?tag_id=${tagToDelete.id}`,
        { requireAuth: true }
      )

      if (response.ok) {
        // Refresh bar tags
        await fetchBarTags(selectedBusiness.id)
        
        toast.success("Tag removed successfully!", {
          description: `${tagToDelete.name} has been removed from ${selectedBusiness.name}.`,
          duration: 4000,
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || "Failed to remove tag")
      }
    } catch (error) {
      console.error("Error removing tag:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to remove tag"
      toast.error("Failed to remove tag", {
        description: errorMessage,
        duration: 5000,
      })
    } finally {
      setIsDeletingTag(null)
    }
  }

  // Filter available tags to exclude already added ones
  const availableTagsToAdd = availableTags.filter(
    tag => !barTags.some(barTag => String(barTag.id) === String(tag.id))
  )

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
            {selectedBusiness ? `Edit Tags for ${selectedBusiness.name}` : 'Edit Business Tags'}
          </h1>
          <p className="text-white mt-2">
            {isLoadingBarTags 
              ? `Loading tags for ${selectedBusiness?.name}...`
              : selectedBusiness 
                ? `Manage tags for ${selectedBusiness.name}`
                : 'Search for a business to manage its tags'
            }
          </p>
        </div>

        {selectedBusiness && (
          <div className="space-y-6">
            {/* Current Tags Card */}
            <Card className="border-border-light bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground text-[var(--dark-sapphire)]">
                  <TagIcon className="h-5 w-5 text-accent" />
                  Current Tags
                </CardTitle>
                <CardDescription className="text-foreground/80 text-[var(--charcoal-gray)]">
                  Tags currently associated with this business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingBarTags ? (
                  <div className="flex items-center gap-2 text-foreground/70">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading tags...</span>
                  </div>
                ) : barTagsError ? (
                  <p className="text-sm text-red-600">Error loading tags: {barTagsError}</p>
                ) : barTags.length === 0 ? (
                  <p className="text-sm text-foreground/70">No tags have been added to this business yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {barTags.map((tag) => (
                      <div
                        key={tag.id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent rounded-full text-sm border border-accent/20"
                      >
                        <span>{tag.name}</span>
                        <span className="text-xs text-foreground/60">({tag.category})</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(tag)}
                          disabled={isDeletingTag === tag.id}
                          className="hover:bg-accent/20 rounded-full p-0.5 disabled:opacity-50"
                          title="Remove tag"
                        >
                          {isDeletingTag === tag.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Tags Card */}
            <Card className="border-border-light bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground text-[var(--dark-sapphire)]">
                  <Plus className="h-5 w-5 text-accent" />
                  Add Tags
                </CardTitle>
                <CardDescription className="text-foreground/80 text-[var(--charcoal-gray)]">
                  Select a tag to add to this business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingAvailableTags ? (
                  <div className="flex items-center gap-2 text-foreground/70">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading available tags...</span>
                  </div>
                ) : availableTagsError ? (
                  <p className="text-sm text-red-600">Error loading available tags: {availableTagsError}</p>
                ) : availableTagsToAdd.length === 0 ? (
                  <p className="text-sm text-foreground/70">All available tags have been added to this business.</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="tag-select" className="text-foreground text-[var(--dark-sapphire)]">
                        Select Tag to Add
                      </Label>
                      <select
                        id="tag-select"
                        value={selectedTagToAdd}
                        onChange={(e) => setSelectedTagToAdd(e.target.value)}
                        className="w-full h-10 px-3 py-2 bg-background border border-border-light rounded-md text-foreground text-[var(--dark-sapphire)] focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value="">Select a tag to add...</option>
                        {availableTagsToAdd.map((tag) => (
                          <option key={String(tag.id)} value={String(tag.id)}>
                            {tag.name} ({tag.category})
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!selectedTagToAdd || isAddingTag}
                      className="px-6 bg-accent hover:bg-accent/90 text-white"
                    >
                      {isAddingTag ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Tag
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => !isDeletingTag && setShowDeleteConfirm(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[var(--dark-sapphire)] mb-2">
              Confirm Removal
            </h3>
            <p className="text-[var(--dark-sapphire)] mb-6">
              Are you sure you want to remove the tag <strong>"{showDeleteConfirm.name}"</strong> from {selectedBusiness?.name}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
                disabled={isDeletingTag === showDeleteConfirm.id}
                className="px-6 border-gray-300 text-[var(--dark-sapphire)] hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeletingTag === showDeleteConfirm.id}
                className="px-6 bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeletingTag === showDeleteConfirm.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

