"use client"

import React from "react"
import { Tag as TagIcon, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface Tag {
  id?: number | string
  name: string
  category: string
  description?: string
}

type Props = {
  selectedTags: Tag[]
  availableTags: Tag[]
  tagsLoading: boolean
  tagsError: string | null
  onAdd: (t: Tag) => void
  onRemove: (t: Tag) => void
}

export default function BarTagsCard({ selectedTags, availableTags, tagsLoading, tagsError, onAdd, onRemove }: Props) {
  return (
    <Card className="border-border-light bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground text-[var(--dark-sapphire)]">
          <TagIcon className="h-5 w-5 text-accent" />
          Bar Tags
        </CardTitle>
        <CardDescription className="text-foreground/80 text-[var(--charcoal-gray)]">
          Select tags that describe your bar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {selectedTags.length > 0 && (
          <div className="space-y-2">
            <Label className="text-foreground text-[var(--dark-sapphire)] font-medium">Selected Tags</Label>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag, index) => (
                <div
                  key={`${tag.name}-${tag.category}-${index}`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full text-sm"
                >
                  <span>{tag.name}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(tag)}
                    className="hover:bg-accent/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tagsLoading && (
          <p className="text-sm text-foreground/70">Loading tags...</p>
        )}
        {tagsError && (
          <p className="text-sm text-red-600">Error loading tags: {tagsError}.</p>
        )}

        <div className="space-y-2">
          <Label htmlFor="bar-tags" className="text-foreground text-[var(--dark-sapphire)]">Tags</Label>
          <select
            id="bar-tags"
            onChange={(e) => {
              const val = e.target.value
              if (val) {
                const tag = availableTags.find(t => String(t.id) === val)
                if (tag) onAdd(tag)
                e.currentTarget.value = ""
              }
            }}
            className="w-full h-10 px-3 py-2 bg-background border border-border-light rounded-md text-foreground text-[var(--dark-sapphire)] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Select a tag...</option>
            {availableTags.map((tag) => (
              <option key={String(tag.id) || tag.name} value={String(tag.id)}>
                {tag.name} · {tag.category}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  )
}
