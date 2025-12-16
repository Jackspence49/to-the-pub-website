"use client"

import React, { useState } from "react"
import { Tag as TagIcon, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'
import { api } from "@/lib/api"

interface TagFormData {
  name: string
  category: "type" | "amenity" | ""
}

interface ValidationErrors {
  name?: string
  category?: string
}

const validateName = (name: string): boolean => {
  if (!name.trim()) return false
  // Allow letters, numbers, spaces, hyphens, and apostrophes, 2-50 characters
  const nameRegex = /^[a-zA-Z0-9\s'-]{2,50}$/
  return nameRegex.test(name.trim())
}

export default function CreateBarTagPage() {
  const [formData, setFormData] = useState<TagFormData>({
    name: "",
    category: "",
  })

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

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

    setIsLoading(true)

    try {
      const response = await api.post(
        "/api/tags",
        {
          name: formData.name.trim(),
          category: formData.category,
        },
        { requireAuth: true }
      )

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch {
          // If JSON parsing fails, use default message
        }
        throw new Error(errorMessage)
      }

      // Success - show toast and reset form
      toast.success("Tag created successfully!", {
        description: `${formData.name} has been added as a ${formData.category} tag.`,
        duration: 4000,
      })

      // Reset form
      setFormData({
        name: "",
        category: "",
      })
      setValidationErrors({})
      setServerError(null)

      // Optionally navigate back or refresh
      // router.push('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create tag"
      setServerError(errorMessage)
      toast.error("Failed to create tag", {
        description: errorMessage,
        duration: Infinity,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Create Bar Tag</h1>
          <p className="text-foreground/80 mt-2 text-[var(--light-gray)]">Add a new tag to categorize bars</p>
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
                Tag Information
              </CardTitle>
              <CardDescription className="text-foreground/80 text-[var(--dark-sapphire)]">
                Enter the tag name and select a category
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
                "Create Tag"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
