"use client"

import React from "react"
import { Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

type Props = {
  days: DayInfo[]
  barHours: BarHours[]
  onChange: (day: number, field: keyof BarHours, value: string | boolean) => void
  validationErrors?: { [key: string]: string }
}

export default function BarHoursCard({ days, barHours, onChange, validationErrors }: Props) {
  return (
    <Card className="border-border-light bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground text-[var(--dark-sapphire)]">
          <Clock className="h-5 w-5 text-accent" />
          Bar Hours
        </CardTitle>
        <CardDescription className="text-foreground/80 text-[var(--charcoal-gray)]">
          Set your business hours for each day of the week. Leave times empty if closed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {days.map((day) => {
          const dayHours = barHours.find(hours => hours.dayOfWeek === day.id)
          if (!dayHours) return null

          return (
            <div key={day.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="md:col-span-1">
                <Label className="text-foreground text-[var(--dark-sapphire)] font-medium">
                  {day.name}
                </Label>
              </div>

              <div className="md:col-span-1">
                <Label htmlFor={`closed-${day.id}`} className="flex items-center gap-2 text-foreground text-[var(--dark-sapphire)]">
                  <input
                    type="checkbox"
                    id={`closed-${day.id}`}
                    checked={dayHours.isClosed}
                    onChange={(e) => onChange(day.id, "isClosed", e.target.checked)}
                    className="rounded border-border-light"
                  />
                  Closed
                </Label>
              </div>

              <div className="md:col-span-1">
                <Label htmlFor={`open-${day.id}`} className="text-foreground text-[var(--dark-sapphire)]">Open Time</Label>
                <Input
                  id={`open-${day.id}`}
                  type="time"
                  value={dayHours.openTime}
                  onChange={(e) => onChange(day.id, "openTime", e.target.value)}
                  disabled={dayHours.isClosed}
                  className={`bg-background border-border-light text-foreground text-[var(--dark-sapphire)] ${
                    validationErrors?.[`${day.id}_openTime`] || validationErrors?.[`${day.id}_times`] ? "border-red-500" : ""
                  }`}
                />
                {validationErrors?.[`${day.id}_openTime`] && (
                  <p className="text-sm text-red-600">{validationErrors[`${day.id}_openTime`]}</p>
                )}
              </div>

              <div className="md:col-span-1">
                <Label htmlFor={`close-${day.id}`} className="text-foreground text-[var(--dark-sapphire)]">Close Time</Label>
                <Input
                  id={`close-${day.id}`}
                  type="time"
                  value={dayHours.closeTime}
                  onChange={(e) => onChange(day.id, "closeTime", e.target.value)}
                  disabled={dayHours.isClosed}
                  className={`bg-background border-border-light text-foreground text-[var(--dark-sapphire)] ${
                    validationErrors?.[`${day.id}_closeTime`] || validationErrors?.[`${day.id}_times`] ? "border-red-500" : ""
                  }`}
                />
                {validationErrors?.[`${day.id}_closeTime`] && (
                  <p className="text-sm text-red-600">{validationErrors[`${day.id}_closeTime`]}</p>
                )}
              </div>

              <div className="md:col-span-1">
                {validationErrors?.[`${day.id}_times`] && (
                  <p className="text-sm text-red-600">{validationErrors[`${day.id}_times`]}</p>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
