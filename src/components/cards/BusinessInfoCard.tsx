"use client"

import React from "react"
import { MapPin, Building, Share2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface Tag {
  id?: number | string
  name: string
  category: "type" | "amenity"
}

interface BusinessInfo {
  name: string
  streetAddress: string
  city: string
  state: string
  postalCode: string
  phone: string
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

type SocialLinkField = "website" | "instagram" | "facebook" | "twitter" | "posh" | "eventbrite"

const SOCIAL_LINK_INPUTS: Array<{ key: SocialLinkField; label: string; placeholder: string }> = [
  { key: "website", label: "Website", placeholder: "https://yourbar.com" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourbar" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourbar" },
  { key: "twitter", label: "Twitter", placeholder: "https://twitter.com/yourbar" },
  { key: "posh", label: "POSH", placeholder: "https://posh.vip/event" },
  { key: "eventbrite", label: "Eventbrite", placeholder: "https://eventbrite.com/e/your-event" },
]

interface ValidationErrors {
  business?: { [key: string]: string }
  barHours?: { [key: string]: string }
}

type USState = { value: string; label: string }

type Props = {
  businessInfo: BusinessInfo
  validationErrors: ValidationErrors
  onChange: (field: keyof BusinessInfo, value: string) => void
  autocompleteRef: React.RefObject<HTMLInputElement | null>
  US_STATES: USState[]
}

export default function BusinessInfoCard({ businessInfo, validationErrors, onChange, autocompleteRef, US_STATES }: Props) {
  return (
    <Card className="border-border-light bg-white shadow-lg shadow-slate-200/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground text-[var(--dark-sapphire)]">
          <Building className="h-5 w-5 text-accent" />
          Business Information
        </CardTitle>
        <CardDescription className="text-foreground/80 text-[var(--charcoal-gray)]">
          Search for your business to auto-populate essentials, then refine location and contact details before launching.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="business-name" className="text-foreground text-[var(--dark-sapphire)]">Business Name *</Label>
            <Input
              id="business-name"
              value={businessInfo.name}
              onChange={(e) => onChange("name", e.target.value)}
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
              onChange={(e) => onChange("streetAddress", e.target.value)}
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
              onChange={(e) => onChange("city", e.target.value)}
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
              onChange={(e) => onChange("state", e.target.value)}
              required
              className={`w-full h-10 px-3 py-2 bg-background border border-border-light rounded-md text-foreground text-[var(--dark-sapphire)] focus:outline-none focus:ring-2 focus:ring-accent ${
                validationErrors.business?.state ? "border-red-500" : ""
              }`}
            >
              <option value="">Select a state</option>
              {US_STATES.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
            {validationErrors.business?.state && (
              <p className="text-sm text-red-600">{validationErrors.business.state}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="postal-code" className="text-foreground text-[var(--dark-sapphire)]">Postal Code *</Label>
            <Input
              id="postal-code"
              value={businessInfo.postalCode}
              onChange={(e) => onChange("postalCode", e.target.value)}
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
              onChange={(e) => onChange("phone", e.target.value)}
              placeholder="Enter phone number (e.g., 123-456-7890)"
              className={`bg-background border-border-light text-foreground text-[var(--dark-sapphire)] ${
                validationErrors.business?.phone ? "border-red-500" : ""
              }`}
            />
            {validationErrors.business?.phone && (
              <p className="text-sm text-red-600">{validationErrors.business.phone}</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-5">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-white p-2 text-accent shadow-sm">
              <Share2 className="h-4 w-4" />
            </span>
            <div>
              <p className="font-semibold text-[var(--dark-sapphire)]">Digital footprint</p>
              <p className="text-sm text-slate-500">
                Drop the profiles we can amplify across the To The Pub app, newsletters, and event spotlights.
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {SOCIAL_LINK_INPUTS.map((field) => {
              const errorMessage = validationErrors.business?.[field.key]
              const spanTwoColumns = field.key === "website"

              return (
                <div key={field.key} className={spanTwoColumns ? "md:col-span-2" : ""}>
                  <Label htmlFor={field.key} className="text-foreground text-[var(--dark-sapphire)]">{field.label}</Label>
                  <Input
                    id={field.key}
                    type="url"
                    value={businessInfo[field.key]}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className={`bg-background border-border-light text-foreground text-[var(--dark-sapphire)] ${
                      errorMessage ? "border-red-500" : ""
                    }`}
                  />
                  {errorMessage && (
                    <p className="text-sm text-red-600">{errorMessage}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
