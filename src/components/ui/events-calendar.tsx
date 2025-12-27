"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface CalendarEvent {
  id: string | number
  title: string
  date: string // YYYY-MM-DD
  start_time?: string | null
  end_time?: string | null
}

interface EventsCalendarProps {
  month: Date
  eventsByDate: Record<string, CalendarEvent[]>
  onPrevMonth: () => void
  onNextMonth: () => void
  onEventDoubleClick?: (event: CalendarEvent) => void
  className?: string
}

function formatMonthTitle(d: Date) {
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" })
}

function getMonthMatrix(month: Date) {
  const year = month.getFullYear()
  const m = month.getMonth()
  const firstDay = new Date(year, m, 1)
  const lastDay = new Date(year, m + 1, 0)

  // Start from Sunday
  const startOffset = firstDay.getDay() // 0 (Sun) .. 6 (Sat)
  const daysInMonth = lastDay.getDate()

  const days: (Date | null)[] = []
  for (let i = 0; i < startOffset; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, m, d))
  while (days.length % 7 !== 0) days.push(null)
  return days
}

export function EventsCalendar({ month, eventsByDate, onPrevMonth, onNextMonth, onEventDoubleClick, className }: EventsCalendarProps) {
  const days = getMonthMatrix(month)
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)

  return (
    <div className={cn("w-full h-full border border-border-light rounded-md bg-white flex flex-col", className)}>
      <div className="flex items-center justify-between p-3 border-b border-border-light">
        <Button variant="ghost" size="sm" onClick={onPrevMonth}>
          ‹ Prev
        </Button>
        <div className="font-semibold text-black">{formatMonthTitle(month)}</div>
        <Button variant="ghost" size="sm" onClick={onNextMonth}>
          Next ›
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border-light">
        {weekDays.map((wd) => (
          <div key={wd} className="bg-white p-2 text-center text-xs font-medium text-gray-700">
            {wd}
          </div>
        ))}
      </div>

      <div
        className="flex-1 grid grid-cols-7 gap-px bg-border-light"
        style={{ gridTemplateRows: "repeat(6, 1fr)" }}
      >
        {days.map((d, idx) => {
          if (!d) {
            return <div key={idx} className="bg-gray-50 h-full" />
          }
          const y = d.getFullYear()
          const m = String(d.getMonth() + 1).padStart(2, "0")
          const day = String(d.getDate()).padStart(2, "0")
          const key = `${y}-${m}-${day}`
          const evts = eventsByDate[key] || []
          return (
            <button
              type="button"
              key={idx}
              className={cn(
                "bg-white h-full p-2 text-left",
                selectedDate === key ? "ring-2 ring-blue-300" : ""
              )}
              onClick={() => setSelectedDate(selectedDate === key ? null : key)}
            >
              <div className="text-xs text-gray-700 mb-1">{d.getDate()}</div>
              <div className="space-y-1">
                {evts.slice(0, 3).map((e) => (
                  <div
                    key={e.id}
                    role="button"
                    tabIndex={0}
                    className="w-full text-left text-xs text-black truncate px-1 py-0.5 rounded bg-blue-50 border border-blue-100 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                    onDoubleClick={() => onEventDoubleClick?.(e)}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" || ev.key === " ") {
                        ev.preventDefault()
                        onEventDoubleClick?.(e)
                      }
                    }}
                  >
                    {e.title}
                  </div>
                ))}
                {evts.length > 3 && (
                  <div className="text-[11px] text-gray-600">+{evts.length - 3} more</div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {selectedDate && (eventsByDate[selectedDate]?.length ?? 0) > 0 && (
        <div className="border-t border-border-light p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-black">
              Events on {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)}>Close</Button>
          </div>
          <div className="space-y-2">
            {(eventsByDate[selectedDate] || []).map((e) => (
              <button
                key={e.id}
                type="button"
                className="w-full text-left text-sm text-black rounded-md px-2 py-1 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                onDoubleClick={() => onEventDoubleClick?.(e)}
              >
                <span className="font-medium">{e.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default EventsCalendar
