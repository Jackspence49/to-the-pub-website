"use client"

import React, { useCallback, useEffect, useState } from "react"
import { Toaster, toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/ui/search-bar"
import { api } from "@/lib/api"

interface SearchResult {
	id: string | number
	name: string
	address_street?: string
	address_city?: string
	address_state?: string
}

interface SearchResponse {
	results: SearchResult[]
	total: number
	limit: number
	offset: number
}

interface EventTag {
	id: string
	name: string
}

interface EventFormState {
	bar_id: string
	title: string
	description: string
	start_time: string
	end_time: string
	image_url: string | null
	event_tag_id: string
	external_link: string | null
	recurrence_pattern: "none" | "daily" | "weekly" | "monthly"
	recurrence_days: number[]
	start_date: string
	// end can be expressed as a date or as a number of occurrences
	recurrence_end_mode?: "date" | "occurrences"
	recurrence_end_date?: string | null
	recurrence_end_occurrences?: number | null
}

const initialForm: EventFormState = {
	bar_id: "",
	title: "",
	description: "",
	start_time: "",
	end_time: "",
	image_url: null,
	event_tag_id: "",
	external_link: null,
	recurrence_pattern: "none",
	recurrence_days: [],
	start_date: "",
	recurrence_end_mode: "date",
	recurrence_end_date: null,
	recurrence_end_occurrences: null,
}

export default function NewEventPage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [searchResults, setSearchResults] = useState<SearchResult[]>([])
	const [isSearching, setIsSearching] = useState(false)
	const [selectedBar, setSelectedBar] = useState<SearchResult | null>(null)

	const [tags, setTags] = useState<EventTag[]>([])
	const [isLoadingTags, setIsLoadingTags] = useState(false)

	const [form, setForm] = useState<EventFormState>(initialForm)
	const [isSubmitting, setIsSubmitting] = useState(false)

	// 12-hour time picker state for friendly UI
	const [startHour, setStartHour] = useState<string>("11")
	const [startMinute, setStartMinute] = useState<string>("30")
	const [startAmPm, setStartAmPm] = useState<string>("AM")

	const [endHour, setEndHour] = useState<string>("6")
	const [endMinute, setEndMinute] = useState<string>("30")
	const [endAmPm, setEndAmPm] = useState<string>("PM")

// no external base URL needed; use internal API proxy

	const handleSearch = useCallback(async (query: string) => {
		if (!query.trim()) {
			setSearchResults([])
			return
		}
		setIsSearching(true)
		try {
			const searchUrl = `/api/bars/search?q=${encodeURIComponent(query)}&limit=10`
			const response = await api.get(searchUrl, { requireAuth: true })
			if (response.ok) {
				const data = await response.json() as SearchResponse
				setSearchResults(data.results || [])
			} else {
				setSearchResults([])
			}
		} catch {
			setSearchResults([])
		} finally {
			setIsSearching(false)
		}
	}, [])

	useEffect(() => {
		const t = setTimeout(() => {
			if (selectedBar && searchQuery !== selectedBar.name) {
				setSelectedBar(null)
				setForm((prev) => ({ ...prev, bar_id: "" }))
			}
			if (selectedBar && searchQuery === selectedBar.name) {
				setSearchResults([])
				return
			}
			if (searchQuery.trim().length >= 2) {
				handleSearch(searchQuery)
			} else {
				setSearchResults([])
			}
		}, 300)
		return () => clearTimeout(t)
	}, [searchQuery, handleSearch, selectedBar])

	const handleSelectBar = useCallback((bar: SearchResult) => {
		setSelectedBar(bar)
		setSearchQuery(bar.name)
		setSearchResults([])
		setForm((prev) => ({ ...prev, bar_id: String(bar.id) }))
	}, [])

	const handleClearSearch = useCallback(() => {
		setSelectedBar(null)
		setSearchQuery("")
		setSearchResults([])
		setForm((prev) => ({ ...prev, bar_id: "" }))
	}, [])

	const fetchEventTags = useCallback(async () => {
		setIsLoadingTags(true)
		try {
			// Use internal proxy route to avoid CORS and centralize auth/header forwarding
			const response = await api.get(`/api/event-tags`, { requireAuth: true })
			if (!response.ok) throw new Error("Failed to fetch event tags")
			const data = await response.json()
			const raw = Array.isArray(data) ? data : (data?.data ?? [])
			type RawTag = { id: string | number; name: string }
			const arr: RawTag[] = Array.isArray(raw) ? (raw as RawTag[]) : []
			const mapped: EventTag[] = arr.map((t) => ({ id: String(t.id), name: String(t.name) }))
			setTags(mapped)
		} catch (e: unknown) {
			const desc = e instanceof Error ? e.message : ""
			toast.error("Unable to load event tags", { description: desc })
		} finally {
			setIsLoadingTags(false)
		}
	}, [])

	useEffect(() => {
		fetchEventTags()
	}, [fetchEventTags])

	const setField = (field: keyof EventFormState, value: unknown) => {
		setForm((prev) => ({ ...prev, [field]: value }))
	}

	const toggleRecurrenceDay = (day: number) => {
		setForm((prev) => {
			const has = prev.recurrence_days.includes(day)
			return {
				...prev,
				recurrence_days: has
					? prev.recurrence_days.filter((d) => d !== day)
					: [...prev.recurrence_days, day]
			}
		})
	}

	// Clear recurrence days when pattern is not weekly
	useEffect(() => {
		if (form.recurrence_pattern !== "weekly" && form.recurrence_days.length > 0) {
			setField("recurrence_days", [])
		}
	}, [form.recurrence_pattern, form.recurrence_days.length])

	// When pattern is 'none', clear recurrence end settings
	useEffect(() => {
		if (form.recurrence_pattern === "none") {
			setField("recurrence_end_mode", undefined)
			setField("recurrence_end_date", null)
			setField("recurrence_end_occurrences", null)
			setField("recurrence_days", [])
		}
	}, [form.recurrence_pattern])

	const validate = (): boolean => {
		if (!form.bar_id) {
			toast.error("Please select a bar via search")
			return false
		}
		if (!form.title.trim()) {
			toast.error("Title is required")
			return false
		}
		if (!form.start_time || !form.end_time) {
			toast.error("Start and end time are required")
			return false
		}
		if (!form.event_tag_id) {
			toast.error("Please select an event tag")
			return false
		}
		return true
	}

	// Sync start selector -> form.start_time (HH:MM:SS 24h)
	useEffect(() => {
		if (!startHour || !startMinute || !startAmPm) return
		let hh = parseInt(startHour, 10) % 12
		if (startAmPm === "PM") hh = (hh + 12) % 24
		const hhStr = String(hh).padStart(2, "0")
		const time = `${hhStr}:${startMinute}:00`
		setField("start_time", time)
	}, [startHour, startMinute, startAmPm])

	// Sync end selector -> form.end_time
	useEffect(() => {
		if (!endHour || !endMinute || !endAmPm) return
		let hh = parseInt(endHour, 10) % 12
		if (endAmPm === "PM") hh = (hh + 12) % 24
		const hhStr = String(hh).padStart(2, "0")
		const time = `${hhStr}:${endMinute}:00`
		setField("end_time", time)
	}, [endHour, endMinute, endAmPm])

	// If form values are reset from outside, reflect them in selectors
	useEffect(() => {
		if (!form.start_time) return
		const [h, m] = form.start_time.split(":")
		const hhNum = parseInt(h, 10)
		const ampm = hhNum >= 12 ? "PM" : "AM"
		let hh12 = hhNum % 12
		if (hh12 === 0) hh12 = 12
		setStartHour(String(hh12))
		setStartMinute(m)
		setStartAmPm(ampm)
	}, [form.start_time])

	useEffect(() => {
		if (!form.end_time) return
		const [h, m] = form.end_time.split(":")
		const hhNum = parseInt(h, 10)
		const ampm = hhNum >= 12 ? "PM" : "AM"
		let hh12 = hhNum % 12
		if (hh12 === 0) hh12 = 12
		setEndHour(String(hh12))
		setEndMinute(m)
		setEndAmPm(ampm)
	}, [form.end_time])

	// When switching end mode, clear the opposite field
	useEffect(() => {
		if (form.recurrence_end_mode === "date") {
			setField("recurrence_end_occurrences", null)
		}
		if (form.recurrence_end_mode === "occurrences") {
			setField("recurrence_end_date", null)
		}
	}, [form.recurrence_end_mode])

	const handleSubmit = async () => {
		if (!validate() || isSubmitting) return
		setIsSubmitting(true)
		try {
			const payload = {
				bar_id: form.bar_id,
				title: form.title,
				description: form.description || null,
				recurrence_start_date: form.start_date || null,
				start_time: form.start_time,
				end_time: form.end_time,
				image_url: form.image_url || null,
				event_tag_id: form.event_tag_id,
				external_link: form.external_link || null,
				recurrence_pattern: form.recurrence_pattern,
				recurrence_days: form.recurrence_days,
				recurrence_end_date: form.recurrence_end_mode === "date" ? (form.recurrence_end_date || null) : null,
				recurrence_end_occurrences: form.recurrence_end_mode === "occurrences" ? (form.recurrence_end_occurrences || null) : null,
			}

			const response = await api.post(`/api/events`, payload, { requireAuth: true })
			if (response.ok) {
				toast.success("Event created successfully")
				setForm(initialForm)
				setSelectedBar(null)
				setSearchQuery("")
			} else {
				const err = await response.json().catch(() => ({}))
				throw new Error(err.message || "Failed to create event")
			}
		} catch (e: unknown) {
			const desc = e instanceof Error ? e.message : ""
			toast.error("Failed to create event", { description: desc })
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="min-h-screen bg-background py-8 px-4">
			<Toaster position="top-right" richColors expand />
			<div className="mx-auto max-w-2xl space-y-6">
				<SearchBar
					value={searchQuery}
					onChange={setSearchQuery}
					onSearch={handleSearch}
					onClear={handleClearSearch}
					onResultSelect={handleSelectBar}
					placeholder="Search for bars and restaurants..."
					size="lg"
					className="w-full mb-2"
					disabled={isSearching}
					results={searchResults}
					isLoading={isSearching}
					showDropdown={true}
				/>
				<div className="text-center">
					<h1 className="text-3xl font-bold text-white">Create New Event</h1>
					<p className="text-white mt-2">
						{selectedBar ? `Creating event for ${selectedBar.name}` : "Select a bar to attach the event"}
					</p>
				</div>

				<Card className="border-border-light bg-white">
					<CardHeader>
						<CardTitle className="text-foreground text-[var(--dark-sapphire)]">Event Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="title" className="text-foreground text-[var(--dark-sapphire)]">Title</Label>
							  <Input id="title" className="bg-white text-black placeholder:text-gray-500 border-border-light" value={form.title} onChange={(e) => setField("title", e.target.value)} />
						</div>

						<div className="space-y-2">
							<Label htmlFor="description" className="text-foreground text-[var(--dark-sapphire)]">Description</Label>
							  <Input id="description" className="bg-white text-black placeholder:text-gray-500 border-border-light" value={form.description} onChange={(e) => setField("description", e.target.value)} />
						</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="start_time" className="text-foreground text-[var(--dark-sapphire)]">Start Time</Label>
									<div className="flex items-center gap-2">
										<select
											value={startHour}
											onChange={(e) => setStartHour(e.target.value)}
											className="h-9 rounded-md border border-border-light bg-white text-black px-2"
										>
											{Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
												<option key={h} value={String(h)}>{h}</option>
											))}
										</select>

										<select value={startMinute} onChange={(e) => setStartMinute(e.target.value)} className="h-9 rounded-md border border-border-light bg-white text-black px-2">
											{["00","15","30","45"].map((m) => (
												<option key={m} value={m}>{m}</option>
											))}
										</select>

										<select value={startAmPm} onChange={(e) => setStartAmPm(e.target.value)} className="h-9 rounded-md border border-border-light bg-white text-black px-2">
											<option value="AM">AM</option>
											<option value="PM">PM</option>
										</select>
									</div>

									{/* Recurrence start date moved below start time for easier access */}
				{/* Start date moved below start time for easier access */}
				<div className="mt-3">
					<Label htmlFor="start_date" className="text-foreground text-[var(--dark-sapphire)]">Start Date</Label>
					<Input id="start_date" type="date" className="mt-1 bg-white text-black placeholder:text-gray-500 border-border-light" value={form.start_date} onChange={(e) => setField("start_date", e.target.value)} />
				</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="end_time" className="text-foreground text-[var(--dark-sapphire)]">End Time</Label>
									<div className="flex items-center gap-2">
										<select value={endHour} onChange={(e) => setEndHour(e.target.value)} className="h-9 rounded-md border border-border-light bg-white text-black px-2">
											{Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
												<option key={h} value={String(h)}>{h}</option>
											))}
										</select>
										<select value={endMinute} onChange={(e) => setEndMinute(e.target.value)} className="h-9 rounded-md border border-border-light bg-white text-black px-2">
											{["00","15","30","45"].map((m) => (
												<option key={m} value={m}>{m}</option>
											))}
										</select>
										<select value={endAmPm} onChange={(e) => setEndAmPm(e.target.value)} className="h-9 rounded-md border border-border-light bg-white text-black px-2">
											<option value="AM">AM</option>
											<option value="PM">PM</option>
										</select>
									</div>
								</div>
							</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="image_url" className="text-foreground text-[var(--dark-sapphire)]">Image URL (optional)</Label>
								<Input id="image_url" className="bg-white text-black placeholder:text-gray-500 border-border-light" value={form.image_url ?? ""} onChange={(e) => setField("image_url", e.target.value || null)} />
							</div>
							<div className="space-y-2">
								<Label htmlFor="external_link" className="text-foreground text-[var(--dark-sapphire)]">External Link (optional)</Label>
								<Input id="external_link" className="bg-white text-black placeholder:text-gray-500 border-border-light" value={form.external_link ?? ""} onChange={(e) => setField("external_link", e.target.value || null)} />
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="event_tag" className="text-foreground text-[var(--dark-sapphire)]">Event Tag</Label>
							<select
								id="event_tag"
								className="w-full h-10 rounded-md border border-border-light bg-white text-black px-3"
								value={form.event_tag_id}
								onChange={(e) => setField("event_tag_id", e.target.value)}
								disabled={isLoadingTags}
							>
								<option value="">{isLoadingTags ? "Loading tags..." : "Select a tag"}</option>
								{tags.map((t) => (
									<option key={t.id} value={t.id}>{t.name}</option>
								))}
							</select>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="recurrence_pattern" className="text-foreground text-[var(--dark-sapphire)]">Recurrence Pattern</Label>
								<select
									id="recurrence_pattern"
									className="w-full h-10 rounded-md border border-border-light bg-white text-black px-3"
									value={form.recurrence_pattern}
									onChange={(e) => setField("recurrence_pattern", e.target.value as EventFormState["recurrence_pattern"]) }
								>
									<option value="none">None</option>
									<option value="daily">Daily</option>
									<option value="weekly">Weekly</option>
									<option value="monthly">Monthly</option>
									{/* yearly removed to match API spec */}
								</select>
							</div>
							{form.recurrence_pattern === "weekly" && (
								<div className="space-y-2">
									<Label className="text-foreground text-[var(--dark-sapphire)]">Recurrence Days</Label>
									<div className="flex gap-1">
										{([0,1,2,3,4,5,6] as number[]).map((d, idx) => {
											const active = form.recurrence_days.includes(d)
											const letters = ["S","M","T","W","T","F","S"]
											return (
												<Button
													key={d}
													type="button"
													onClick={() => toggleRecurrenceDay(d)}
													className={
														`h-8 w-8 flex items-center justify-center rounded-full text-xs font-medium transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ` +
														(active
															? `bg-accent text-white`
															: `bg-white text-[var(--dark-sapphire)] border border-border-light`)
													}
													aria-pressed={active}
													aria-label={`Toggle ${letters[idx]}`}
												>
													{letters[idx]}
												</Button>
											)
										})}
									</div>
								</div>
							)}
						</div>

						{(form.recurrence_pattern as unknown) !== "none" && (
							<>
								<div className="grid grid-cols-1 gap-4">
									{form.recurrence_pattern !== "none" && (
										<div className="space-y-2">
											<Label className="text-foreground text-[var(--dark-sapphire)]">Recurrence End</Label>
											{/* Option: End On Date */}
											<div className={`w-full rounded-md p-3 flex items-center justify-between border ${form.recurrence_end_mode === "date" ? "border-accent bg-accent/10" : "border-border-light bg-white"}`}>
												<div className="flex items-center gap-3">
													<input
														type="radio"
														name="recurrence_end_mode"
														value="date"
														checked={form.recurrence_end_mode === "date"}
														onChange={() => setField("recurrence_end_mode", "date")}
														className="h-4 w-4"
													/>
													<span className="text-[var(--dark-sapphire)] font-medium">On</span>
												</div>
												<Input
													id="recurrence_end_date"
													type="date"
													className="w-44 bg-white text-black placeholder:text-gray-500 border-border-light"
													value={form.recurrence_end_date ?? ""}
													onChange={(e) => setField("recurrence_end_date", e.target.value)}
													disabled={form.recurrence_end_mode !== "date"}
												/>
											</div>
											{/* Option: End After N Occurrences */}
											<div className={`w-full rounded-md p-3 flex items-center justify-between border ${form.recurrence_end_mode === "occurrences" ? "border-accent bg-accent/10" : "border-border-light bg-white"}`}>
												<div className="flex items-center gap-3">
													<input
														type="radio"
														name="recurrence_end_mode"
														value="occurrences"
														checked={form.recurrence_end_mode === "occurrences"}
														onChange={() => setField("recurrence_end_mode", "occurrences")}
														className="h-4 w-4"
													/>
													<span className="text-[var(--dark-sapphire)] font-medium">After</span>
												</div>
												<div className="flex items-center gap-2">
													<Input
														id="recurrence_end_occurrences"
														type="number"
														min={1}
														className="w-28 bg-white text-black placeholder:text-gray-500 border-border-light"
														placeholder="# occurrences"
														value={form.recurrence_end_occurrences ?? ""}
														onChange={(e) => setField("recurrence_end_occurrences", e.target.value ? parseInt(e.target.value, 10) : null)}
														disabled={form.recurrence_end_mode !== "occurrences"}
													/>
													<span className="text-sm text-[var(--dark-sapphire)]">occurrences</span>
												</div>
											</div>
										</div>
									)}
								</div>

							</>
						)}

						<div className="flex justify-end pt-2">
							<Button
								type="button"
								onClick={handleSubmit}
								disabled={isSubmitting || !selectedBar}
								className="bg-blue-600 hover:bg-blue-700 text-white"
							>
								{isSubmitting ? "Submitting..." : "Create Event"}
							</Button>
						</div>
							</CardContent>
					</Card>
			</div>
		</div>
	)
}

