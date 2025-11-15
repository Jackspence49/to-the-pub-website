"use client"

import React, { useState, useEffect } from "react"
import { Tag as TagIcon, Loader2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'
import { api } from "@/lib/api"

interface Tag {
  id?: number | string
  name: string
  category: 'type' | 'amenity'
}

interface TagFormData {
  name: string
  category: "type" | "amenity" | ""
}

interface ValidationErrors {
  name?: string
  category?: string
  tag?: string
}

const validateName = (name: string): boolean => {
  if (!name.trim()) return false
  // Allow letters, numbers, spaces, hyphens, and apostrophes, 2-50 characters
  const nameRegex = /^[a-zA-Z0-9\s'-]{2,50}$/
  return nameRegex.test(name.trim())
}

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message
  try {
    return String(err)
  } catch {
    return "Unknown error"
  }
}

export default function EditBarTagPage() {
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [tagsLoading, setTagsLoading] = useState<boolean>(false)
  const [tagsError, setTagsError] = useState<string | null>(null)
  const [selectedTagId, setSelectedTagId] = useState<string>("")
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  
  const [formData, setFormData] = useState<TagFormData>({
    name: "",
    category: "",
  })

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const router = useRouter()

  // Handle Escape key to close delete confirmation dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDeleteConfirm && !isDeleting) {
        setShowDeleteConfirm(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [showDeleteConfirm, isDeleting])

  // Fetch all tags on component mount
  useEffect(() => {
    let mounted = true
    const fetchTags = async () => {
      setTagsLoading(true)
      setTagsError(null)
      try {
        const response = await api.get("/api/tags", { requireAuth: true })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch tags: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

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
          setAvailableTags(tags)
        }
      } catch (err: unknown) {
        const message = getErrorMessage(err)
        console.error("Error fetching tags:", message)
        if (mounted) {
          setTagsError(message)
          toast.error("Failed to load tags", {
            description: message,
            duration: 5000,
          })
        }
      } finally {
        if (mounted) setTagsLoading(false)
      }
    }

    fetchTags()
    return () => { mounted = false }
  }, [])

  // Handle tag selection from dropdown
  const handleTagSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tagId = e.target.value
    setSelectedTagId(tagId)
    setServerError(null)
    setValidationErrors({})

    if (!tagId) {
      setSelectedTag(null)
      setFormData({
        name: "",
        category: "",
      })
      return
    }

    const tag = availableTags.find(t => String(t.id) === tagId)
    if (tag) {
      setSelectedTag(tag)
      setFormData({
        name: tag.name,
        category: tag.category,
      })
    }
  }

  const handleFieldChange = (field: keyof TagFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
    // Clear server error when user makes changes
    if (serverError) {
      setServerError(null)
    }
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}
    let isValid = true

    if (!selectedTagId) {
      errors.tag = "Please select a tag to edit"
      isValid = false
    }

    if (!validateName(formData.name)) {
      errors.name = "Tag name must be 2-50 characters and contain only letters, numbers, spaces, hyphens, and apostrophes"
      isValid = false
    }

    if (formData.category !== "type" && formData.category !== "amenity") {
      errors.category = "Please select a category"
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

    if (!selectedTagId) {
      toast.error("Please select a tag to edit")
      return
    }

    setIsLoading(true)

    try {
      const endpoint = `/api/tags/${selectedTagId}`
      console.log("Making request to:", endpoint)
      console.log("Selected tag ID:", selectedTagId)
      console.log("Form data:", { name: formData.name.trim(), category: formData.category })
      
      const response = await api.put(
        endpoint,
        {
          name: formData.name.trim(),
          category: formData.category,
        },
        { requireAuth: true }
      )
      
      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
          
          // Handle specific error statuses
          if (response.status === 404) {
            errorMessage = "Tag not found"
          } else if (response.status === 409) {
            errorMessage = "A tag with this name already exists. Please choose a different name."
          } else if (response.status === 400) {
            errorMessage = errorData.error || "Invalid request. Please check all fields are filled correctly."
          } else if (response.status === 401) {
            errorMessage = "Authentication required. Please log in again."
          }
        } catch {
          // If JSON parsing fails, use default message
        }
        throw new Error(errorMessage)
      }

      // Success - show toast
      toast.success("Tag updated successfully!", {
        description: `${formData.name} has been updated as a ${formData.category} tag.`,
        duration: 4000,
      })

      // Reset form
      setSelectedTagId("")
      setSelectedTag(null)
      setFormData({
        name: "",
        category: "",
      })
      setValidationErrors({})
      setServerError(null)

      // Refresh tags list to get updated data
      const refreshResponse = await api.get("/api/tags", { requireAuth: true })
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        let tags: Tag[] = []
        if (Array.isArray(refreshData)) {
          tags = refreshData
        } else if (Array.isArray(refreshData.tags)) {
          tags = refreshData.tags
        } else if (Array.isArray(refreshData.data)) {
          tags = refreshData.data
        }
        setAvailableTags(tags)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update tag"
      setServerError(errorMessage)
      toast.error("Failed to update tag", {
        description: errorMessage,
        duration: Infinity,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = () => {
    if (!selectedTagId) {
      toast.error("Please select a tag to delete")
      return
    }
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false)
    setIsDeleting(true)
    setServerError(null)

    try {
      const endpoint = `/api/tags/${selectedTagId}`
      console.log("Making delete request to:", endpoint)
      console.log("Selected tag ID:", selectedTagId)
      
      const response = await api.delete(endpoint, { requireAuth: true })
      
      console.log("Delete response status:", response.status)
      console.log("Delete response ok:", response.ok)

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
          
          // Handle specific error statuses
          if (response.status === 404) {
            errorMessage = "Tag not found"
          } else if (response.status === 401) {
            errorMessage = "Authentication required. Please log in again."
          }
        } catch {
          // If JSON parsing fails, use default message
        }
        throw new Error(errorMessage)
      }

      // Success - show toast
      toast.success("Tag deleted successfully!", {
        description: `${selectedTag?.name} has been deleted.`,
        duration: 4000,
      })

      // Reset form
      setSelectedTagId("")
      setSelectedTag(null)
      setFormData({
        name: "",
        category: "",
      })
      setValidationErrors({})
      setServerError(null)

      // Refresh tags list to get updated data
      const refreshResponse = await api.get("/api/tags", { requireAuth: true })
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        let tags: Tag[] = []
        if (Array.isArray(refreshData)) {
          tags = refreshData
        } else if (Array.isArray(refreshData.tags)) {
          tags = refreshData.tags
        } else if (Array.isArray(refreshData.data)) {
          tags = refreshData.data
        }
        setAvailableTags(tags)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete tag"
      setServerError(errorMessage)
      toast.error("Failed to delete tag", {
        description: errorMessage,
        duration: Infinity,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Edit Bar Tag</h1>
          <p className="text-foreground/80 mt-2 text-[var(--light-gray)]">Select and update an existing tag</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {serverError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {serverError}
            </div>
          )}

          <Card className="bg-white border-border-light">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground text-[var(--dark-sapphire)]">
                <TagIcon className="h-5 w-5 text-accent" />
                Select Tag
              </CardTitle>
              <CardDescription className="text-foreground/80 text-[var(--dark-sapphire)]">
                Choose the tag you want to edit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tag-select" className="text-foreground text-[var(--dark-sapphire)]">
                  Tag to Edit *
                </Label>
                {tagsLoading ? (
                  <div className="flex items-center gap-2 text-foreground/70">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading tags...</span>
                  </div>
                ) : tagsError ? (
                  <p className="text-sm text-red-600">Error loading tags: {tagsError}</p>
                ) : (
                  <select
                    id="tag-select"
                    value={selectedTagId}
                    onChange={handleTagSelect}
                    className={`w-full h-10 px-3 py-2 bg-background border border-border-light rounded-md text-foreground text-[var(--dark-sapphire)] focus:outline-none focus:ring-2 focus:ring-accent ${
                      validationErrors.tag ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Select a tag to edit...</option>
                    {availableTags.map((tag) => (
                      <option key={String(tag.id)} value={String(tag.id)}>
                        {tag.name} ({tag.category})
                      </option>
                    ))}
                  </select>
                )}
                {validationErrors.tag && (
                  <p className="text-sm text-red-600">{validationErrors.tag}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedTag && (
            <Card className="bg-white border-border-light">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground text-[var(--dark-sapphire)]">
                  <TagIcon className="h-5 w-5 text-accent" />
                  Tag Information
                </CardTitle>
                <CardDescription className="text-foreground/80 text-[var(--dark-sapphire)]">
                  Update the tag name and category
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tag-name" className="text-foreground text-[var(--dark-sapphire)]">
                    Tag Name *
                  </Label>
                  <Input
                    id="tag-name"
                    value={formData.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    placeholder="e.g., Arcade Bar"
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
                  <Label className="text-foreground text-[var(--dark-sapphire)]">
                    Category *
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="category-type"
                        name="category"
                        value="type"
                        checked={formData.category === "type"}
                        onChange={(e) => handleFieldChange("category", e.target.value)}
                        className="h-4 w-4 text-accent focus:ring-accent border-border-light"
                      />
                      <Label
                        htmlFor="category-type"
                        className="text-foreground text-[var(--dark-sapphire)] cursor-pointer font-normal"
                      >
                        Type
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="category-amenity"
                        name="category"
                        value="amenity"
                        checked={formData.category === "amenity"}
                        onChange={(e) => handleFieldChange("category", e.target.value)}
                        className="h-4 w-4 text-accent focus:ring-accent border-border-light"
                      />
                      <Label
                        htmlFor="category-amenity"
                        className="text-foreground text-[var(--dark-sapphire)] cursor-pointer font-normal"
                      >
                        Amenity
                      </Label>
                    </div>
                  </div>
                  {validationErrors.category && (
                    <p className="text-sm text-red-600">{validationErrors.category}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit and Delete Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              size="lg"
              variant="destructive"
              className="px-8 bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting || isLoading || !selectedTag}
              onClick={handleDeleteClick}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Tag
                </>
              )}
            </Button>
            <Button
              type="submit"
              size="lg"
              className="px-8 bg-accent hover:bg-accent/90 text-white"
              disabled={isLoading || isDeleting || !selectedTag}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Tag"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => !isDeleting && setShowDeleteConfirm(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[var(--dark-sapphire)] mb-2">
              Confirm Deletion
            </h3>
            <p className="text-[var(--dark-sapphire)] mb-6">
              Are you sure you want to delete the tag <strong>"{selectedTag?.name}"</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-6 border-gray-300 text-[var(--dark-sapphire)] hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-6 bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

