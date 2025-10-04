"use client"

import React from "react"
import { MapPin, Building } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

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

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="website" className="text-foreground text-[var(--dark-sapphire)]">Website</Label>
            <Input
              id="website"
              type="text"
              value={businessInfo.website}
              onChange={(e) => onChange("website", e.target.value)}
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
  )
}
