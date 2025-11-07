"use client"

import React, { useState, useEffect } from "react"
import { Clock, Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

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

interface HoursBlock {
  id: string
  openTime: string
  closeTime: string
  selectedDays: number[]
}

type Props = {
  days: DayInfo[]
  barHours: BarHours[]
  onChange: (day: number, field: keyof BarHours, value: string | boolean) => void
  validationErrors?: { [key: string]: string }
}

export default function BarHoursCard({ days, barHours, onChange, validationErrors }: Props) {
  // Initialize hoursBlocks from barHours prop
  const initializeFromBarHours = (barHours: BarHours[]): HoursBlock[] => {
    console.log("Initializing hours blocks from barHours:", barHours)
    const groupedHours = new Map<string, number[]>()
    
    barHours.forEach(hour => {
      console.log("Processing hour:", hour)
      if (!hour.isClosed) {
        // Ensure times are properly formatted before creating the key
        const openTime = hour.openTime || "09:00"
        const closeTime = hour.closeTime || "22:00"
        const key = `${openTime}|${closeTime}` // Use | instead of - to avoid conflicts
        console.log("Created key:", key, "from openTime:", openTime, "closeTime:", closeTime)
        if (!groupedHours.has(key)) {
          groupedHours.set(key, [])
        }
        groupedHours.get(key)!.push(hour.dayOfWeek)
      }
    })
    
    console.log("Grouped hours map:", groupedHours)
    
    const result = Array.from(groupedHours.entries()).map(([timeKey, dayIds], index) => {
      const [openTime, closeTime] = timeKey.split('|') // Split on | instead of -
      console.log("Splitting timeKey:", timeKey, "into openTime:", openTime, "closeTime:", closeTime)
      return {
        id: `block-${index}`,
        openTime: openTime || "09:00",
        closeTime: closeTime || "22:00",
        selectedDays: dayIds
      }
    })
    
    console.log("Final hours blocks:", result)
    return result
  }

  const [hoursBlocks, setHoursBlocks] = useState<HoursBlock[]>(() => initializeFromBarHours(barHours))

  // Sync hoursBlocks with barHours prop changes (when API data comes in)
  useEffect(() => {
    const newHoursBlocks = initializeFromBarHours(barHours)
    setHoursBlocks(newHoursBlocks)
  }, [barHours])

  const addHoursBlock = () => {
    const newBlock: HoursBlock = {
      id: `block-${Date.now()}`,
      openTime: '09:00',
      closeTime: '17:00',
      selectedDays: []
    }
    setHoursBlocks([...hoursBlocks, newBlock])
  }

  const removeHoursBlock = (blockId: string) => {
    const blockToRemove = hoursBlocks.find(b => b.id === blockId)
    if (blockToRemove) {
      // Mark removed days as closed
      blockToRemove.selectedDays.forEach(dayId => {
        onChange(dayId, 'isClosed', true)
      })
    }
    setHoursBlocks(hoursBlocks.filter(block => block.id !== blockId))
  }

  const updateHoursBlock = (blockId: string, field: 'openTime' | 'closeTime', value: string) => {
    // Find the block and its selected days before updating state
    const targetBlock = hoursBlocks.find(b => b.id === blockId)
    if (!targetBlock) return
    
    // Update internal state first
    setHoursBlocks(blocks => 
      blocks.map(block => {
        if (block.id === blockId) {
          return { ...block, [field]: value }
        }
        return block
      })
    )
    
    // Update parent state after internal state update
    targetBlock.selectedDays.forEach(dayId => {
      onChange(dayId, field, value)
      onChange(dayId, 'isClosed', false)
    })
  }

  const toggleDaySelection = (blockId: string, dayId: number) => {
    const targetBlock = hoursBlocks.find(b => b.id === blockId)
    if (!targetBlock) return
    
    const isCurrentlySelected = targetBlock.selectedDays.includes(dayId)
    
    // Update state first
    setHoursBlocks(blocks => {
      // Create new blocks array with proper immutable updates
      const newBlocks = blocks.map(block => {
        if (block.id === blockId) {
          // Handle the target block
          if (isCurrentlySelected) {
            // Remove day from this block
            return {
              ...block,
              selectedDays: block.selectedDays.filter(id => id !== dayId)
            }
          } else {
            // Add day to this block
            return {
              ...block,
              selectedDays: [...block.selectedDays, dayId]
            }
          }
        } else if (block.selectedDays.includes(dayId) && !isCurrentlySelected) {
          // Remove day from other blocks when adding to target block
          return {
            ...block,
            selectedDays: block.selectedDays.filter(id => id !== dayId)
          }
        }
        return block
      })
      
      return newBlocks
    })
    
    // Handle onChange calls after state update (outside of setState)
    if (isCurrentlySelected) {
      onChange(dayId, 'isClosed', true)
    } else {
      onChange(dayId, 'openTime', targetBlock.openTime)
      onChange(dayId, 'closeTime', targetBlock.closeTime)
      onChange(dayId, 'isClosed', false)
    }
  }

  const getClosedDays = () => {
    const allSelectedDays = hoursBlocks.flatMap(block => block.selectedDays)
    return days.filter(day => !allSelectedDays.includes(day.id))
  }

  return (
    <Card className="border-border-light bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-black">
          <Clock className="h-5 w-5 text-accent" />
          Bar Hours
        </CardTitle>
        <CardDescription className="text-black">
          Set your business hours. Select multiple days with the same hours to save time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {hoursBlocks.map((block) => (
          <div key={block.id} className="border border-border-light rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`open-${block.id}`} className="text-foreground text-[var(--dark-sapphire)]">
                  Open At
                </Label>
                <Input
                  id={`open-${block.id}`}
                  type="time"
                  value={block.openTime}
                  onChange={(e) => updateHoursBlock(block.id, 'openTime', e.target.value)}
                  className="bg-background border-border-light text-foreground text-[var(--dark-sapphire)]"
                />
              </div>
              <div>
                <Label htmlFor={`close-${block.id}`} className="text-foreground text-[var(--dark-sapphire)]">
                  Close At
                </Label>
                <Input
                  id={`close-${block.id}`}
                  type="time"
                  value={block.closeTime}
                  onChange={(e) => updateHoursBlock(block.id, 'closeTime', e.target.value)}
                  className="bg-background border-border-light text-foreground text-[var(--dark-sapphire)]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-foreground text-[var(--dark-sapphire)]">
                  Select Days
                </Label>
                {hoursBlocks.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHoursBlock(block.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {days.map((day) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${block.id}-day-${day.id}`}
                      checked={block.selectedDays.includes(day.id)}
                      onCheckedChange={() => toggleDaySelection(block.id, day.id)}
                    />
                    <Label
                      htmlFor={`${block.id}-day-${day.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[var(--dark-sapphire)]"
                    >
                      {day.shortName}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addHoursBlock}
          className="w-full border-dashed border-border-light text-[var(--dark-sapphire)] hover:bg-gray-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Hours Set
        </Button>

        {getClosedDays().length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <Label className="text-foreground text-[var(--dark-sapphire)] font-medium block mb-2">
              Closed Days
            </Label>
            <div className="flex flex-wrap gap-2">
              {getClosedDays().map(day => (
                <span
                  key={day.id}
                  className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm"
                >
                  {day.shortName}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Display validation errors */}
        {validationErrors && Object.keys(validationErrors).length > 0 && (
          <div className="space-y-2">
            {Object.entries(validationErrors).map(([key, error]) => (
              <p key={key} className="text-sm text-red-600">{error}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
