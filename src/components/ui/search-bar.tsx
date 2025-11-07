"use client"

import React, { useState, useRef, useEffect } from "react"
import { Search, X, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string | number
  name: string
  address_street?: string
  address_city?: string
  address_state?: string
}

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch?: (value: string) => void
  onClear?: () => void
  onResultSelect?: (result: SearchResult) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  autoFocus?: boolean
  showClearButton?: boolean
  size?: "sm" | "md" | "lg"
  results?: SearchResult[]
  isLoading?: boolean
  showDropdown?: boolean
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  onClear,
  onResultSelect,
  placeholder = "Search...",
  className,
  disabled = false,
  autoFocus = false,
  showClearButton = true,
  size = "md",
  results = [],
  isLoading = false,
  showDropdown = false
}: SearchBarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setIsDropdownOpen(showDropdown && (results.length > 0 || isLoading))
  }, [showDropdown, results.length, isLoading])

  // Maintain focus when search results update
  useEffect(() => {
    // If the input should have focus but doesn't, restore it
    if (value && inputRef.current && document.activeElement !== inputRef.current) {
      // Only restore if not focused on a dropdown element
      const isDropdownFocused = searchRef.current?.contains(document.activeElement)
      if (!isDropdownFocused) {
        setTimeout(() => {
          inputRef.current?.focus()
          // Restore cursor position to the end
          if (inputRef.current) {
            const length = inputRef.current.value.length
            inputRef.current.setSelectionRange(length, length)
          }
        }, 50) // Slightly longer delay to ensure DOM is stable
      }
    }
  }, [results, value])
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      e.preventDefault()
      onSearch(value)
    }
    if (e.key === "Escape") {
      setIsDropdownOpen(false)
    }
  }

  const handleClear = () => {
    onChange("")
    setIsDropdownOpen(false)
    if (onClear) {
      onClear()
    }
  }

  const handleResultClick = (result: SearchResult) => {
    setIsDropdownOpen(false)
    if (onResultSelect) {
      onResultSelect(result)
    }
  }

  const handleFocus = () => {
    if (showDropdown && (results.length > 0 || isLoading)) {
      setIsDropdownOpen(true)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    // Ensure input maintains focus after onChange
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Prevent blur if the related target is within the search component
    // This helps maintain focus when results are updating
    const relatedTarget = e.relatedTarget as HTMLElement
    if (searchRef.current?.contains(relatedTarget)) {
      e.preventDefault()
      inputRef.current?.focus()
    }
  }

  const sizeClasses = {
    sm: "h-8 text-sm",
    md: "h-9 text-sm",
    lg: "h-11 text-base"
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  }

  return (
    <div className={cn("relative flex items-center", className)} ref={searchRef}>
      <div className="relative flex-1">
        <Search 
          className={cn(
            "absolute left-3 top-1/2 transform -translate-y-1/2 text-black",
            iconSizes[size]
          )} 
        />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={handleFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(
            "pl-10 pr-10 text-black placeholder:text-gray-500 bg-white",
            sizeClasses[size],
            showClearButton && value && "pr-10"
          )}
        />
        {showClearButton && value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            className={cn(
              "absolute right-1 top-1/2 transform -translate-y-1/2 h-auto p-1 hover:bg-muted/50",
              size === "sm" && "p-0.5",
              size === "lg" && "p-1.5"
            )}
          >
            <X className={cn("text-black", iconSizes[size])} />
          </Button>
        )}
        
        {/* Dropdown Results */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border-light rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
            {isLoading && (
              <div className="px-4 py-3 text-sm text-black text-center">
                Searching...
              </div>
            )}
            {!isLoading && results.length === 0 && value && (
              <div className="px-4 py-3 text-sm text-black text-center">
                No results found for &quot;{value}&quot;
              </div>
            )}
            {!isLoading && results.map((result) => (
              <div
                key={result.id}
                onClick={() => handleResultClick(result)}
                className="px-4 py-3 hover:bg-blue-50 hover:shadow-sm cursor-pointer border-b border-border-light last:border-b-0 transition-all duration-200 ease-in-out"
              >
                <div className="font-medium text-black">{result.name}</div>
                {(result.address_street || result.address_city) && (
                  <div className="flex items-center text-sm text-black mt-1">
                    <MapPin className="h-3 w-3 mr-1 text-black" />
                    {[result.address_street, result.address_city, result.address_state]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}