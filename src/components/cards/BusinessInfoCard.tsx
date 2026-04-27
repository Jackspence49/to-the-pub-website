"use client"

import React, { useState } from "react"
import { MapPin, Building, Share2, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Tag {
  id?: number | string
  name: string
  category: string
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

type SocialLinkField = "website" | "instagram" | "facebook" | "twitter" | "posh" | "eventbrite"

const SOCIAL_LINK_INPUTS: Array<{ key: SocialLinkField; label: string; placeholder: string }> = [
  { key: "website",    label: "Website",    placeholder: "https://yourbar.com" },
  { key: "instagram",  label: "Instagram",  placeholder: "https://instagram.com/yourbar" },
  { key: "facebook",   label: "Facebook",   placeholder: "https://facebook.com/yourbar" },
  { key: "twitter",    label: "Twitter",    placeholder: "https://twitter.com/yourbar" },
  { key: "posh",       label: "POSH",       placeholder: "https://posh.vip/event" },
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
  placeSelected: boolean
  onClearPlace: () => void
}

export default function BusinessInfoCard({
  businessInfo,
  validationErrors,
  onChange,
  autocompleteRef,
  US_STATES,
  placeSelected,
  onClearPlace,
}: Props) {
  const [showEditFields, setShowEditFields] = useState(false)
  const [isManual, setIsManual] = useState(false)

  // Auto-expand address fields whenever there are validation errors on them
  const hasAddressErrors = Boolean(
    validationErrors.business?.name ||
    validationErrors.business?.streetAddress ||
    validationErrors.business?.city ||
    validationErrors.business?.state ||
    validationErrors.business?.postalCode
  )

  const isSearchMode = !placeSelected && !isManual
  const showAddressFields = isManual || (placeSelected && (showEditFields || hasAddressErrors))
  const showSocials = placeSelected || isManual

  const handleSearchAgain = () => {
    setIsManual(false)
    setShowEditFields(false)
    onClearPlace()
  }

  return (
    <Card className="border-border-light bg-white shadow-lg shadow-slate-200/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-[var(--dark-sapphire)]">
          <Building className="h-5 w-5 text-accent" />
          Business Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Search input — always in DOM so the Google Autocomplete instance stays attached.
            Hidden via CSS once a place is confirmed or manual mode is active. */}
        <div className={isSearchMode ? "space-y-2" : "hidden"} aria-hidden={!isSearchMode}>
          <Label htmlFor="business-search" className="text-[var(--dark-sapphire)]">
            Search for the bar
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-accent" />
            <Input
              ref={autocompleteRef}
              id="business-search"
              placeholder="Type bar name or address…"
              className="pl-10 bg-background border-border-light text-[var(--dark-sapphire)]"
              autoComplete="off"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsManual(true)}
            className="text-sm text-slate-500 underline-offset-2 hover:text-accent hover:underline transition-colors"
          >
            Can&apos;t find it? Enter manually
          </button>
        </div>

        {/* Confirmation card — shown after a Google place is selected */}
        {placeSelected && !isManual && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-[var(--dark-sapphire)]">{businessInfo.name}</p>
                <p className="text-sm text-slate-600">
                  {businessInfo.streetAddress}, {businessInfo.city}, {businessInfo.state} {businessInfo.postalCode}
                </p>
                {businessInfo.phone && (
                  <p className="mt-0.5 text-sm text-slate-500">{businessInfo.phone}</p>
                )}
                {businessInfo.website && (
                  <p className="mt-0.5 text-sm text-slate-500 truncate max-w-sm">{businessInfo.website}</p>
                )}
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            </div>
            <div className="mt-3 flex gap-4 text-sm">
              <button
                type="button"
                onClick={() => setShowEditFields(v => !v)}
                className="text-accent underline-offset-2 hover:underline"
              >
                {showEditFields && !hasAddressErrors ? "Hide fields" : "Edit details"}
              </button>
              <button
                type="button"
                onClick={handleSearchAgain}
                className="text-slate-500 underline-offset-2 hover:underline"
              >
                Search again
              </button>
            </div>
          </div>
        )}

        {/* Manual mode banner */}
        {isManual && (
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
            <span className="text-sm text-slate-500">Entering details manually</span>
            <button
              type="button"
              onClick={handleSearchAgain}
              className="text-sm text-accent underline-offset-2 hover:underline"
            >
              Use search instead
            </button>
          </div>
        )}

        {/* Editable address + contact fields */}
        {showAddressFields && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="business-name" className="text-[var(--dark-sapphire)]">Name *</Label>
              <Input
                id="business-name"
                value={businessInfo.name}
                onChange={e => onChange("name", e.target.value)}
                placeholder="Bar name"
                className={`bg-background border-border-light text-[var(--dark-sapphire)] ${validationErrors.business?.name ? "border-red-500" : ""}`}
              />
              {validationErrors.business?.name && (
                <p className="text-xs text-red-600">{validationErrors.business.name}</p>
              )}
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="street-address" className="text-[var(--dark-sapphire)]">Street Address *</Label>
              <Input
                id="street-address"
                value={businessInfo.streetAddress}
                onChange={e => onChange("streetAddress", e.target.value)}
                placeholder="123 Main St"
                className={`bg-background border-border-light text-[var(--dark-sapphire)] ${validationErrors.business?.streetAddress ? "border-red-500" : ""}`}
              />
              {validationErrors.business?.streetAddress && (
                <p className="text-xs text-red-600">{validationErrors.business.streetAddress}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-[var(--dark-sapphire)]">City *</Label>
              <Input
                id="city"
                value={businessInfo.city}
                onChange={e => onChange("city", e.target.value)}
                placeholder="City"
                className={`bg-background border-border-light text-[var(--dark-sapphire)] ${validationErrors.business?.city ? "border-red-500" : ""}`}
              />
              {validationErrors.business?.city && (
                <p className="text-xs text-red-600">{validationErrors.business.city}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="state" className="text-[var(--dark-sapphire)]">State *</Label>
              <select
                id="state"
                value={businessInfo.state}
                onChange={e => onChange("state", e.target.value)}
                className={`w-full h-10 px-3 py-2 bg-background border border-border-light rounded-md text-[var(--dark-sapphire)] focus:outline-none focus:ring-2 focus:ring-accent ${validationErrors.business?.state ? "border-red-500" : ""}`}
              >
                <option value="">Select state</option>
                {US_STATES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              {validationErrors.business?.state && (
                <p className="text-xs text-red-600">{validationErrors.business.state}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="postal-code" className="text-[var(--dark-sapphire)]">ZIP Code *</Label>
              <Input
                id="postal-code"
                value={businessInfo.postalCode}
                onChange={e => onChange("postalCode", e.target.value)}
                placeholder="12345"
                className={`bg-background border-border-light text-[var(--dark-sapphire)] ${validationErrors.business?.postalCode ? "border-red-500" : ""}`}
              />
              {validationErrors.business?.postalCode && (
                <p className="text-xs text-red-600">{validationErrors.business.postalCode}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-[var(--dark-sapphire)]">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={businessInfo.phone}
                onChange={e => onChange("phone", e.target.value)}
                placeholder="123-456-7890"
                className={`bg-background border-border-light text-[var(--dark-sapphire)] ${validationErrors.business?.phone ? "border-red-500" : ""}`}
              />
              {validationErrors.business?.phone && (
                <p className="text-xs text-red-600">{validationErrors.business.phone}</p>
              )}
            </div>
          </div>
        )}

        {/* Description — revealed once a bar is identified */}
        {showSocials && (
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-[var(--dark-sapphire)]">Description</Label>
            <textarea
              id="description"
              value={businessInfo.description}
              onChange={e => onChange("description", e.target.value)}
              placeholder="Brief description of the bar…"
              rows={3}
              className="w-full rounded-md border border-border-light bg-background px-3 py-2 text-sm text-[var(--dark-sapphire)] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            />
          </div>
        )}

        {/* Social & ticketing links — revealed once a bar is identified */}
        {showSocials && (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Share2 className="h-4 w-4 text-accent" />
              <p className="text-sm font-medium text-[var(--dark-sapphire)]">Social &amp; ticketing links</p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {SOCIAL_LINK_INPUTS.map(field => {
                const err = validationErrors.business?.[field.key]
                return (
                  <div key={field.key} className={field.key === "website" ? "md:col-span-2 space-y-1.5" : "space-y-1.5"}>
                    <Label htmlFor={field.key} className="text-sm text-[var(--dark-sapphire)]">{field.label}</Label>
                    <Input
                      id={field.key}
                      type="url"
                      value={businessInfo[field.key]}
                      onChange={e => onChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className={`bg-background border-border-light text-[var(--dark-sapphire)] ${err ? "border-red-500" : ""}`}
                    />
                    {err && <p className="text-xs text-red-600">{err}</p>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  )
}
