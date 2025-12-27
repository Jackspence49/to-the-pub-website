"use client"

import { useCallback, useEffect, useMemo, useState, type ComponentProps } from "react"
import { Toaster, toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/ui/search-bar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EventsCalendar, { CalendarEvent } from "@/components/ui/events-calendar"
import { api } from "@/lib/api"

type SearchBarResult = NonNullable<ComponentProps<typeof SearchBar>["results"]>[number]

type SearchResponse = {
	results?: SearchBarResult[]
}

type EventTag = {
	id: string
	name: string
}

type RecurrencePattern = "none" | "daily" | "weekly" | "monthly" | "yearly"
type RecurrenceEndMode = "date" | "occurrences" | undefined

type EventFormState = {
	bar_id: string
	title: string
	description: string
	start_date: string
	start_time: string
	end_time: string
	image_url: string | null
	event_tag_id: string
	external_link: string | null
	recurrence_pattern: RecurrencePattern
	recurrence_days: number[]
	recurrence_end_mode: RecurrenceEndMode
	recurrence_end_date: string | null
	recurrence_end_occurrences: number | null
}

type InstanceEditFormState = {
	date: string
	custom_start_time: string
	custom_end_time: string
	custom_title: string
	custom_description: string
	custom_event_tag_id: string
	custom_external_link: string
	custom_image_url: string
	is_cancelled: boolean
}

type MasterEventEditFormState = EventFormState & {
	is_cancelled: boolean
}

const ID_KEYS = ["id", "event_instance_id", "instance_id", "eventId", "event_id"] as const
const DATE_KEYS = ["date", "start_date", "recurrence_start_date"] as const
const START_DATETIME_KEYS = ["start_datetime", "startDateTime", "start_at", "starts_at", "start"] as const
const END_DATETIME_KEYS = ["end_datetime", "endDateTime", "end_at", "ends_at", "end"] as const
const START_TIME_KEYS = ["start_time", "startTime"] as const
const END_TIME_KEYS = ["end_time", "endTime"] as const
const TITLE_KEYS = ["title", "name", "event_name"] as const
const ARRAY_CONTAINER_KEYS = ["data", "results", "items", "events"] as const

const coerceBoolean = (value: unknown): boolean => {
	if (typeof value === "boolean") return value
	if (typeof value === "number") return value !== 0
	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase()
		if (!normalized) return false
		if (["false", "0", "no", "off"].includes(normalized)) return false
		return ["true", "1", "yes", "on"].includes(normalized)
	}
	return false
}

const emptyToNull = (value: string | null | undefined): string | null => {
	const trimmed = (value ?? "").trim()
	return trimmed ? trimmed : null
}

const ensureTimeWithSeconds = (value?: string | null): string | null => {
	if (!value) return null
	const trimmed = value.trim()
	if (!trimmed) return null
	if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed
	if (/^\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`
	return null
}

const formatTimeInputValue = (value?: string | null): string => {
	if (!value) return ""
	const trimmed = value.trim()
	if (!trimmed) return ""
	const match = trimmed.match(/^(\d{2}):(\d{2})/)
	return match ? `${match[1]}:${match[2]}` : ""
}

const formatTimeWithMeridiem = (value?: string | null): string => {
	const normalized = ensureTimeWithSeconds(value)
	if (!normalized) return "—"
	const [hourStr, minuteStr = "00"] = normalized.split(":")
	const hour = Number(hourStr)
	if (Number.isNaN(hour)) return "—"
	const suffix = hour >= 12 ? "PM" : "AM"
	const hour12 = ((hour + 11) % 12) + 1
	const minutes = minuteStr.padStart(2, "0")
	return `${hour12}:${minutes} ${suffix}`
}

const formatDisplayValue = (value?: string | null): string => {
	if (!value) return "—"
	const trimmed = value.trim()
	return trimmed || "—"
}

const formatDateOnly = (date: Date): string => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, "0")
	const day = String(date.getDate()).padStart(2, "0")
	return `${year}-${month}-${day}`
}

const formatDateToMMDDYYYY = (value?: string | null): string => {
	const ymd = coerceDateString(value)
	if (!ymd) return ""
	const [y, m, d] = ymd.split("-")
	return `${m}-${d}-${y}`
}

const parseMMDDYYYYToYYYYMMDD = (value?: string | null): string | null => {
	if (!value) return null
	const trimmed = value.trim()
	if (!trimmed) return null
	// Accept already-correct format
	if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
	// Accept ISO datetimes
	const isoDate = coerceDateString(trimmed)
	if (isoDate) return isoDate
	// Accept MM-DD-YYYY or MM/DD/YYYY
	const m = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
	if (!m) return null
	const mm = m[1].padStart(2, "0")
	const dd = m[2].padStart(2, "0")
	const yyyy = m[3]
	return `${yyyy}-${mm}-${dd}`
}

const buildInitialFormState = (): EventFormState => ({
	bar_id: "",
	title: "",
	description: "",
	start_date: formatDateOnly(new Date()),
	start_time: "",
	end_time: "",
	image_url: null,
	event_tag_id: "",
	external_link: null,
	recurrence_pattern: "none",
	recurrence_days: [],
	recurrence_end_mode: undefined,
	recurrence_end_date: null,
	recurrence_end_occurrences: null,
})

const buildFormWithBar = (barId?: string | null): EventFormState => {
	const base = buildInitialFormState()
	if (barId !== undefined && barId !== null) base.bar_id = String(barId)
	return base
}

const buildInstanceEditFormState = (): InstanceEditFormState => ({
	date: "",
	custom_start_time: "",
	custom_end_time: "",
	custom_title: "",
	custom_description: "",
	custom_event_tag_id: "",
	custom_external_link: "",
	custom_image_url: "",
	is_cancelled: false,
})

const buildMasterEventEditFormState = (): MasterEventEditFormState => ({
	...buildInitialFormState(),
	is_cancelled: false,
})

type MasterEventApiPayload = {
	title: string
	description: string | null
	start_time: string
	end_time: string
	image_url: string | null
	event_tag_id: string
	external_link: string | null
	recurrence_pattern: RecurrencePattern
	recurrence_days: number[]
	recurrence_end_date: string | null
	recurrence_end_occurrences: number | null
	cancel_all_instances: boolean
	regenerate_instances: boolean
}

const buildMasterEventApiPayload = (
	form: MasterEventEditFormState,
	normalizedStartTime: string,
	normalizedEndTime: string
): MasterEventApiPayload => {
	const recurrenceDays = form.recurrence_pattern === "weekly" ? form.recurrence_days : []
	const recurrenceEndDate =
		form.recurrence_pattern !== "none" && form.recurrence_end_mode === "date"
			? form.recurrence_end_date ?? null
			: null
	const recurrenceEndOccurrences =
		form.recurrence_pattern !== "none" && form.recurrence_end_mode === "occurrences"
			? form.recurrence_end_occurrences ?? null
			: null

	return {
		title: form.title.trim(),
		description: emptyToNull(form.description),
		start_time: normalizedStartTime,
		end_time: normalizedEndTime,
		image_url: emptyToNull(form.image_url),
		event_tag_id: form.event_tag_id,
		external_link: emptyToNull(form.external_link),
		recurrence_pattern: form.recurrence_pattern,
		recurrence_days: recurrenceDays,
		recurrence_end_date: recurrenceEndDate,
		recurrence_end_occurrences: recurrenceEndOccurrences,
		cancel_all_instances: form.is_cancelled,
		regenerate_instances: false,
	}
}

const pickString = (source: Record<string, unknown>, keys: readonly string[]): string | null => {
	for (const key of keys) {
		const raw = source[key]
		if (typeof raw === "string") {
			const trimmed = raw.trim()
			if (trimmed) return trimmed
		}
	}
	return null
}

const coerceDateString = (value?: string | null): string | null => {
	if (!value) return null
	const trimmed = value.trim()
	if (!trimmed) return null
	if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10)
	const parsed = new Date(trimmed)
	return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().split("T")[0]
}

const coerceTimeString = (value?: string | null): string | null => {
	if (!value) return null
	const trimmed = value.trim()
	if (!trimmed) return null
	const hhmm = trimmed.match(/(\d{2}):(\d{2})/)
	if (hhmm) return `${hhmm[1]}:${hhmm[2]}`
	const parsed = new Date(trimmed)
	return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().split("T")[1]?.slice(0, 5) ?? null
}

const extractEventId = (source: Record<string, unknown>): string | number => {
	for (const key of ID_KEYS) {
		const value = source[key]
		if (typeof value === "string" || typeof value === "number") return value
	}
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID()
	}
	return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const normalizeRemoteEvent = (raw: unknown): CalendarEvent | null => {
	if (!raw || typeof raw !== "object") return null
	const source = raw as Record<string, unknown>
	const dateCandidate =
		pickString(source, DATE_KEYS) ??
		pickString(source, START_DATETIME_KEYS)
	const date = coerceDateString(dateCandidate)
	if (!date) return null
	const title = pickString(source, TITLE_KEYS) ?? "Untitled Event"
	const startTime = coerceTimeString(pickString(source, START_TIME_KEYS) ?? pickString(source, START_DATETIME_KEYS))
	const endTime = coerceTimeString(pickString(source, END_TIME_KEYS) ?? pickString(source, END_DATETIME_KEYS))
	return {
		id: extractEventId(source),
		title,
		date,
		start_time: startTime,
		end_time: endTime,
	}
}

const extractEventCollection = (payload: unknown): unknown[] => {
	if (Array.isArray(payload)) return payload
	if (payload && typeof payload === "object") {
		const container = payload as Record<string, unknown>
		for (const key of ARRAY_CONTAINER_KEYS) {
			const value = container[key]
			if (Array.isArray(value)) return value
		}
	}
	return []
}

const groupEventsByDate = (events: CalendarEvent[]): Record<string, CalendarEvent[]> => {
	const grouped: Record<string, CalendarEvent[]> = {}
	for (const event of events) {
		if (!grouped[event.date]) grouped[event.date] = []
		grouped[event.date].push(event)
	}
	for (const key of Object.keys(grouped)) {
		grouped[key].sort((a, b) => {
			const aTime = a.start_time ?? "99:99"
			const bTime = b.start_time ?? "99:99"
			return aTime.localeCompare(bTime)
		})
	}
	return grouped
}

const coerceNumberArray = (value: unknown): number[] => {
	if (!Array.isArray(value)) return []
	return value
		.map((entry) => {
			const num = typeof entry === "number" ? entry : Number(entry)
			return Number.isNaN(num) ? null : num
		})
		.filter((entry): entry is number => entry !== null)
}

const mapApiEventToFormState = (payload: Record<string, unknown>, fallbackBarId?: string): EventFormState => {
	const next = buildInitialFormState()
	if (fallbackBarId) next.bar_id = fallbackBarId
	if (typeof payload.bar_id === "string" || typeof payload.bar_id === "number") {
		next.bar_id = String(payload.bar_id)
	}
	if (typeof payload.title === "string") next.title = payload.title
	if (typeof payload.description === "string") next.description = payload.description
	if (typeof payload.start_time === "string") next.start_time = payload.start_time
	if (typeof payload.end_time === "string") next.end_time = payload.end_time
	if (typeof payload.image_url === "string") next.image_url = payload.image_url
	if (typeof payload.event_tag_id === "string" || typeof payload.event_tag_id === "number") {
		next.event_tag_id = String(payload.event_tag_id)
	}
	if (typeof payload.external_link === "string") next.external_link = payload.external_link
	if (typeof payload.recurrence_pattern === "string") {
		const pattern = payload.recurrence_pattern as EventFormState["recurrence_pattern"]
		if (["none", "daily", "weekly", "monthly", "yearly"].includes(pattern)) {
			next.recurrence_pattern = pattern
		}
	}
	const startDateCandidates = [payload.recurrence_start_date, payload.start_date]
	for (const candidate of startDateCandidates) {
		if (typeof candidate === "string" && candidate.trim()) {
			next.start_date = coerceDateString(candidate) ?? candidate
			break
		}
	}
	const recDays = coerceNumberArray(payload.recurrence_days)
	if (recDays.length) next.recurrence_days = recDays
	if (typeof payload.recurrence_end_mode === "string") {
		next.recurrence_end_mode = payload.recurrence_end_mode as EventFormState["recurrence_end_mode"]
	}
	if (typeof payload.recurrence_end_date === "string") {
		// API may return a full datetime; coerce to date-only (YYYY-MM-DD)
		next.recurrence_end_date = coerceDateString(payload.recurrence_end_date) ?? payload.recurrence_end_date
		if (!next.recurrence_end_mode) next.recurrence_end_mode = "date"
	}
	if (payload.recurrence_end_occurrences != null) {
		const occurrences = Number(payload.recurrence_end_occurrences)
		if (!Number.isNaN(occurrences)) {
			next.recurrence_end_occurrences = occurrences
			if (!next.recurrence_end_mode) next.recurrence_end_mode = "occurrences"
		}
	}
	return next
}

const mapInstancePayloadToFormState = (
	payload: Record<string, unknown>
): { form: InstanceEditFormState; masterEventId: string | number | null } => {
	const form = buildInstanceEditFormState()
	let masterEventId: string | number | null = null
	const masterCandidates = [payload.event_id, payload.master_event_id, payload.eventId]
	for (const candidate of masterCandidates) {
		if (typeof candidate === "string" || typeof candidate === "number") {
			masterEventId = candidate
			break
		}
	}
	if (typeof payload.custom_title === "string") form.custom_title = payload.custom_title
	if (typeof payload.custom_description === "string") form.custom_description = payload.custom_description
	if (typeof payload.custom_event_tag_id === "string" || typeof payload.custom_event_tag_id === "number") {
		form.custom_event_tag_id = String(payload.custom_event_tag_id)
	}
	if (typeof payload.custom_start_time === "string") {
		form.custom_start_time = formatTimeInputValue(payload.custom_start_time)
	}
	if (typeof payload.custom_end_time === "string") {
		form.custom_end_time = formatTimeInputValue(payload.custom_end_time)
	}
	if (typeof payload.custom_external_link === "string") form.custom_external_link = payload.custom_external_link
	if (typeof payload.custom_image_url === "string") form.custom_image_url = payload.custom_image_url
	form.is_cancelled = coerceBoolean(payload.is_cancelled)
	const dateCandidate = pickString(payload, DATE_KEYS)
	form.date = coerceDateString(dateCandidate) ?? ""
	return { form, masterEventId }
}

const mapMasterPayloadToFormState = (payload: Record<string, unknown>, fallbackBarId?: string): MasterEventEditFormState => {
	const base = mapApiEventToFormState(payload, fallbackBarId)
	const withMeta: MasterEventEditFormState = {
		...base,
		is_cancelled: coerceBoolean(
			"cancel_all_instances" in payload ? payload["cancel_all_instances"] : payload.is_cancelled
		),
	}
	const preferredStartDate = typeof payload.start_date === "string" ? payload.start_date : undefined
	if (preferredStartDate) {
		withMeta.start_date = coerceDateString(preferredStartDate) ?? preferredStartDate
	} else if (!withMeta.start_date) {
		const fallbackDate = pickString(payload, DATE_KEYS)
		withMeta.start_date = coerceDateString(fallbackDate) ?? (fallbackDate ?? "")
	}
	withMeta.start_time = ensureTimeWithSeconds(withMeta.start_time) ?? ""
	withMeta.end_time = ensureTimeWithSeconds(withMeta.end_time) ?? ""
	if (withMeta.recurrence_end_date) {
		withMeta.recurrence_end_mode = withMeta.recurrence_end_mode ?? "date"
	}
	return withMeta
}

const unwrapSingleEventPayload = (payload: unknown): Record<string, unknown> | null => {
	if (!payload || typeof payload !== "object") return null
	const candidate = payload as Record<string, unknown>
	if (candidate.data && typeof candidate.data === "object") {
		return candidate.data as Record<string, unknown>
	}
	return candidate
}

export default function NewEventPage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [searchResults, setSearchResults] = useState<SearchBarResult[]>([])
	const [isSearching, setIsSearching] = useState(false)
	const [selectedBar, setSelectedBar] = useState<SearchBarResult | null>(null)
	const [tags, setTags] = useState<EventTag[]>([])
	const [isLoadingTags, setIsLoadingTags] = useState(false)
	const [form, setForm] = useState<EventFormState>(() => buildInitialFormState())
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [startHour, setStartHour] = useState<string>("11")
	const [startMinute, setStartMinute] = useState<string>("30")
	const [startAmPm, setStartAmPm] = useState<string>("AM")
	const [endHour, setEndHour] = useState<string>("6")
	const [endMinute, setEndMinute] = useState<string>("30")
	const [endAmPm, setEndAmPm] = useState<string>("PM")
	const [currentMonth, setCurrentMonth] = useState(() => {
		const now = new Date()
		return new Date(now.getFullYear(), now.getMonth(), 1)
	})
	const [eventsByDate, setEventsByDate] = useState<Record<string, CalendarEvent[]>>({})
	const [rawEventsById, setRawEventsById] = useState<Record<string, Record<string, unknown>>>({})
	const [isLoadingEvents, setIsLoadingEvents] = useState(false)
	const [isFormOpen, setIsFormOpen] = useState(false)
	const [formMode, setFormMode] = useState<"create" | "edit">("create")
	const [editingEventId, setEditingEventId] = useState<string | number | null>(null)
	const [isPrefillingForm, setIsPrefillingForm] = useState(false)
	const [isDualEditModalOpen, setIsDualEditModalOpen] = useState(false)
	const [activeEditTab, setActiveEditTab] = useState<"instance" | "master">("instance")
	const [instanceEditForm, setInstanceEditForm] = useState<InstanceEditFormState>(() => buildInstanceEditFormState())
	const [masterEditForm, setMasterEditForm] = useState<MasterEventEditFormState>(() => buildMasterEventEditFormState())
	const [editingInstanceId, setEditingInstanceId] = useState<string | number | null>(null)
	const [editingMasterEventId, setEditingMasterEventId] = useState<string | number | null>(null)
	const [isDualModalLoading, setIsDualModalLoading] = useState(false)
	const [dualModalError, setDualModalError] = useState<string | null>(null)
	const [isSavingInstance, setIsSavingInstance] = useState(false)
	const [isSavingMaster, setIsSavingMaster] = useState(false)
	const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<CalendarEvent | null>(null)

	const hasEvents = useMemo(() => Object.keys(eventsByDate).length > 0, [eventsByDate])
	const isEditing = formMode === "edit" && editingEventId !== null
	const masterTagName = useMemo(() => {
		if (!masterEditForm.event_tag_id) return null
		const match = tags.find((tag) => tag.id === masterEditForm.event_tag_id)
		return match?.name ?? null
	}, [masterEditForm.event_tag_id, tags])

	const resetFormFields = useCallback((preferredBarId?: string | null) => {
		const template = buildFormWithBar(
			preferredBarId !== undefined ? preferredBarId : selectedBar ? String(selectedBar.id) : undefined
		)
		setForm(template)
		setStartHour("11")
		setStartMinute("30")
		setStartAmPm("AM")
		setEndHour("6")
		setEndMinute("30")
		setEndAmPm("PM")
	}, [selectedBar])

	const handleCloseForm = useCallback(() => {
		setIsFormOpen(false)
		setFormMode("create")
		setEditingEventId(null)
		setIsPrefillingForm(false)
		resetFormFields()
	}, [resetFormFields])

	const resetDualModalState = useCallback(() => {
		setInstanceEditForm(buildInstanceEditFormState())
		setMasterEditForm(buildMasterEventEditFormState())
		setEditingInstanceId(null)
		setEditingMasterEventId(null)
		setDualModalError(null)
		setActiveEditTab("instance")
		setSelectedCalendarEvent(null)
	}, [])

	const handleCloseDualModal = useCallback(() => {
		setIsDualEditModalOpen(false)
		setIsDualModalLoading(false)
		resetDualModalState()
	}, [resetDualModalState])

	const hydrateMasterEvent = useCallback(async (masterId: string | number, barId?: string | number | null) => {
		const response = await api.get(`/api/events/${masterId}`, { requireAuth: true })
		if (!response.ok) throw new Error("Failed to load master event details")
		const payload = await response.json()
		const detail = unwrapSingleEventPayload(payload)
		if (!detail) throw new Error("Master event data missing")
		setMasterEditForm(mapMasterPayloadToFormState(detail, barId ? String(barId) : undefined))
	}, [])

	useEffect(() => {
		if (!isFormOpen) return
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault()
				handleCloseForm()
			}
		}
		window.addEventListener("keydown", onKeyDown)
		return () => window.removeEventListener("keydown", onKeyDown)
	}, [isFormOpen, handleCloseForm])

	const fetchEventsForMonth = useCallback(async (targetMonth: Date, barId?: string | number | null) => {
		if (barId === undefined || barId === null || barId === "") {
			setEventsByDate({})
			setRawEventsById({})
			return
		}
		setIsLoadingEvents(true)
		try {
			const start = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1)
			const end = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0)
			const params = new URLSearchParams({
				bar_id: String(barId),
				date_from: formatDateOnly(start),
				date_to: formatDateOnly(end),
				limit: "500",
			})
			const response = await api.get(`/api/events/instances?${params.toString()}`, { requireAuth: true })
			if (!response.ok) throw new Error("Failed to fetch events")
			const payload = await response.json()
			const rows = extractEventCollection(payload)
			const normalized: CalendarEvent[] = []
			const rawMap: Record<string, Record<string, unknown>> = {}
			rows.forEach((row) => {
				const normalizedEvent = normalizeRemoteEvent(row)
				if (normalizedEvent) {
					normalized.push(normalizedEvent)
					rawMap[String(normalizedEvent.id)] = row as Record<string, unknown>
				}
			})
			setEventsByDate(groupEventsByDate(normalized))
			setRawEventsById(rawMap)
		} catch (error) {
			setEventsByDate({})
			setRawEventsById({})
			const desc = error instanceof Error ? error.message : ""
			toast.error("Unable to load events", { description: desc })
		} finally {
			setIsLoadingEvents(false)
		}
	}, [])

	useEffect(() => {
		if (!selectedBar) {
			setEventsByDate({})
			setRawEventsById({})
			return
		}
		fetchEventsForMonth(currentMonth, selectedBar.id)
	}, [currentMonth, selectedBar, fetchEventsForMonth])

	const handlePrevMonth = useCallback(() => {
		setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
	}, [])

	const handleNextMonth = useCallback(() => {
		setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
	}, [])

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
				setEventsByDate({})
				setRawEventsById({})
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

	const handleSelectBar = useCallback((bar: SearchBarResult) => {
		setSelectedBar(bar)
		setSearchQuery(bar.name)
		setSearchResults([])
		resetFormFields(String(bar.id))
	}, [resetFormFields])

	const handleClearSearch = useCallback(() => {
		setSelectedBar(null)
		setSearchQuery("")
		setSearchResults([])
		setEventsByDate({})
		setRawEventsById({})
		resetFormFields("")
	}, [resetFormFields])

	const fetchEventTags = useCallback(async () => {
		setIsLoadingTags(true)
		try {
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

	const setInstanceField = (field: keyof InstanceEditFormState, value: unknown) => {
		setInstanceEditForm((prev) => ({ ...prev, [field]: value }))
	}

	const setMasterEditField = (field: keyof MasterEventEditFormState, value: unknown) => {
		setMasterEditForm((prev) => ({ ...prev, [field]: value }))
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

	const toggleMasterRecurrenceDay = (day: number) => {
		setMasterEditForm((prev) => {
			const has = prev.recurrence_days.includes(day)
			return {
				...prev,
				recurrence_days: has
					? prev.recurrence_days.filter((d) => d !== day)
					: [...prev.recurrence_days, day],
			}
		})
	}

	useEffect(() => {
		if (form.recurrence_pattern !== "weekly" && form.recurrence_days.length > 0) {
			setField("recurrence_days", [])
		}
	}, [form.recurrence_pattern, form.recurrence_days.length])

	useEffect(() => {
		if (masterEditForm.recurrence_pattern !== "weekly" && masterEditForm.recurrence_days.length > 0) {
			setMasterEditField("recurrence_days", [])
		}
	}, [masterEditForm.recurrence_pattern, masterEditForm.recurrence_days.length])

	useEffect(() => {
		if (form.recurrence_pattern === "none") {
			setField("recurrence_end_mode", undefined)
			setField("recurrence_end_date", null)
			setField("recurrence_end_occurrences", null)
			setField("recurrence_days", [])
		}
	}, [form.recurrence_pattern])

	useEffect(() => {
		if (masterEditForm.recurrence_pattern === "none") {
			setMasterEditField("recurrence_end_mode", undefined)
			setMasterEditField("recurrence_end_date", null)
			setMasterEditField("recurrence_end_occurrences", null)
			setMasterEditField("recurrence_days", [])
		}
	}, [masterEditForm.recurrence_pattern])

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

	useEffect(() => {
		if (!startHour || !startMinute || !startAmPm) return
		let hh = parseInt(startHour, 10) % 12
		if (startAmPm === "PM") hh = (hh + 12) % 24
		const hhStr = String(hh).padStart(2, "0")
		const time = `${hhStr}:${startMinute}:00`
		setField("start_time", time)
	}, [startHour, startMinute, startAmPm])

	useEffect(() => {
		if (!endHour || !endMinute || !endAmPm) return
		let hh = parseInt(endHour, 10) % 12
		if (endAmPm === "PM") hh = (hh + 12) % 24
		const hhStr = String(hh).padStart(2, "0")
		const time = `${hhStr}:${endMinute}:00`
		setField("end_time", time)
	}, [endHour, endMinute, endAmPm])

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

	useEffect(() => {
		if (form.recurrence_end_mode === "date") {
			setField("recurrence_end_occurrences", null)
		}
		if (form.recurrence_end_mode === "occurrences") {
			setField("recurrence_end_date", null)
		}
	}, [form.recurrence_end_mode])

	useEffect(() => {
		if (masterEditForm.recurrence_end_mode === "date") {
			setMasterEditField("recurrence_end_occurrences", null)
		}
		if (masterEditForm.recurrence_end_mode === "occurrences") {
			setMasterEditField("recurrence_end_date", null)
		}
	}, [masterEditForm.recurrence_end_mode])

	const handleAddEventClick = useCallback(() => {
		if (!selectedBar) {
			toast.error("Search for a bar before adding events")
			return
		}
		setFormMode("create")
		setEditingEventId(null)
		setIsPrefillingForm(false)
		resetFormFields(String(selectedBar.id))
		setIsFormOpen(true)
	}, [selectedBar, resetFormFields])

	const handleEventDoubleClick = useCallback(async (calendarEvent: CalendarEvent) => {
		if (!selectedBar) {
			toast.error("Search for a bar before editing events")
			return
		}
		setIsDualEditModalOpen(true)
		setActiveEditTab("instance")
		setDualModalError(null)
		setSelectedCalendarEvent(calendarEvent)
		setEditingInstanceId(calendarEvent.id)
		setEditingMasterEventId(null)
		setIsDualModalLoading(true)
		try {
			const response = await api.get(`/api/events/instances/${calendarEvent.id}`, { requireAuth: true })
			if (!response.ok) throw new Error("Failed to load event instance details")
			const payload = await response.json()
			const detail = unwrapSingleEventPayload(payload) ?? (payload as Record<string, unknown>)
			if (!detail) throw new Error("Instance data missing")
			const mapped = mapInstancePayloadToFormState(detail)
			setInstanceEditForm(mapped.form)
			setEditingMasterEventId(mapped.masterEventId ?? null)
			if (mapped.masterEventId) {
				try {
					await hydrateMasterEvent(mapped.masterEventId, selectedBar.id)
				} catch (masterError) {
					const desc = masterError instanceof Error ? masterError.message : "Unable to load master event"
					setDualModalError(desc)
					toast.error("Unable to load master event", { description: desc })
				}
			} else {
				setMasterEditForm(() => ({
					...buildMasterEventEditFormState(),
					bar_id: String(selectedBar.id),
				}))
			}
		} catch (error) {
			const fallback = rawEventsById[String(calendarEvent.id)]
			if (fallback) {
				const mapped = mapInstancePayloadToFormState(fallback)
				setInstanceEditForm(mapped.form)
				if (mapped.masterEventId) {
					setEditingMasterEventId(mapped.masterEventId)
					try {
						await hydrateMasterEvent(mapped.masterEventId, selectedBar.id)
					} catch (masterError) {
						const desc = masterError instanceof Error ? masterError.message : "Unable to load master event"
						setDualModalError(desc)
					}
				}
			} else {
				setInstanceEditForm({
					...buildInstanceEditFormState(),
					custom_title: calendarEvent.title,
					date: calendarEvent.date,
					custom_start_time: formatTimeInputValue(calendarEvent.start_time ?? null),
					custom_end_time: formatTimeInputValue(calendarEvent.end_time ?? null),
				})
				setMasterEditForm(() => ({
					...buildMasterEventEditFormState(),
					bar_id: String(selectedBar.id),
				}))
			}
			const desc = error instanceof Error ? error.message : "Unable to load event instance"
			setDualModalError(desc)
			toast.error("Unable to load event instance", { description: desc })
		} finally {
			setIsDualModalLoading(false)
		}
	}, [hydrateMasterEvent, rawEventsById, selectedBar])

	const handleSubmit = async () => {
		if (!validate() || isSubmitting) return
		setIsSubmitting(true)
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

		try {
			const response = isEditing
				? await api.put(`/api/events/${editingEventId}`, payload, { requireAuth: true })
				: await api.post(`/api/events`, payload, { requireAuth: true })
			if (response.ok) {
				toast.success(isEditing ? "Event updated successfully" : "Event created successfully")
				await fetchEventsForMonth(currentMonth, selectedBar?.id)
				resetFormFields(selectedBar ? String(selectedBar.id) : undefined)
				setIsFormOpen(false)
				setFormMode("create")
				setEditingEventId(null)
			} else {
				const err = await response.json().catch(() => ({}))
				throw new Error(err.message || (isEditing ? "Failed to update event" : "Failed to create event"))
			}
		} catch (e: unknown) {
			const desc = e instanceof Error ? e.message : ""
			toast.error(isEditing ? "Failed to update event" : "Failed to create event", { description: desc })
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleInstanceSubmit = useCallback(async () => {
		if (!editingInstanceId) {
			toast.error("No event instance selected")
			return
		}
		if (!instanceEditForm.date) {
			toast.error("Instance date is required")
			return
		}
		setIsSavingInstance(true)
		try {
			const payload = {
				custom_start_time: ensureTimeWithSeconds(instanceEditForm.custom_start_time) ?? null,
				custom_end_time: ensureTimeWithSeconds(instanceEditForm.custom_end_time) ?? null,
				custom_description: emptyToNull(instanceEditForm.custom_description),
				custom_title: emptyToNull(instanceEditForm.custom_title),
				custom_event_tag_id: instanceEditForm.custom_event_tag_id || null,
				is_cancelled: instanceEditForm.is_cancelled,
				custom_external_link: emptyToNull(instanceEditForm.custom_external_link),
				custom_image_url: emptyToNull(instanceEditForm.custom_image_url),
				date: instanceEditForm.date,
			}
			const response = await api.put(`/api/events/instances/${editingInstanceId}`, payload, { requireAuth: true })
			if (!response.ok) {
				const err = await response.json().catch(() => ({}))
				throw new Error(err.message || "Failed to update event instance")
			}
			toast.success("Event instance updated")
			await fetchEventsForMonth(currentMonth, selectedBar?.id)
			setDualModalError(null)
		} catch (error) {
			const desc = error instanceof Error ? error.message : ""
			toast.error("Failed to update event instance", { description: desc })
		} finally {
			setIsSavingInstance(false)
		}
	}, [editingInstanceId, instanceEditForm, fetchEventsForMonth, currentMonth, selectedBar])

	const handleMasterEditSubmit = useCallback(async () => {
		if (!editingMasterEventId) {
			toast.error("No master event selected")
			return
		}
		if (!masterEditForm.title.trim()) {
			toast.error("Event name is required")
			return
		}
		const normalizedStartTime = ensureTimeWithSeconds(masterEditForm.start_time)
		const normalizedEndTime = ensureTimeWithSeconds(masterEditForm.end_time)
		if (!normalizedStartTime || !normalizedEndTime) {
			toast.error("Start and end times are required")
			return
		}
		if (!masterEditForm.event_tag_id) {
			toast.error("Select an event tag")
			return
		}
		setIsSavingMaster(true)
		try {
			const payload = buildMasterEventApiPayload(masterEditForm, normalizedStartTime, normalizedEndTime)
			const response = await api.put(`/api/events/${editingMasterEventId}`, payload, { requireAuth: true })
			if (!response.ok) {
				const err = await response.json().catch(() => ({}))
				throw new Error(err.message || "Failed to update master event")
			}
			toast.success("Master event updated")
			await fetchEventsForMonth(currentMonth, selectedBar?.id)
			setDualModalError(null)
		} catch (error) {
			const desc = error instanceof Error ? error.message : ""
			toast.error("Failed to update master event", { description: desc })
		} finally {
			setIsSavingMaster(false)
		}
	}, [editingMasterEventId, masterEditForm, fetchEventsForMonth, currentMonth, selectedBar])

	return (
		<>
			<div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#081131] to-[#040918] text-white flex flex-col">
				<Toaster position="top-right" richColors expand />
				<header className="px-4 py-8 md:px-10 flex flex-col gap-4">
				<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
					<div className="flex-1 space-y-4">
						<div>
							<h1 className="text-3xl font-bold tracking-tight">Events Command Center</h1>
							<p className="text-white/80 max-w-2xl">
								Browse each venue’s schedule at a glance, then launch fresh experiences without leaving the calendar.
							</p>
						</div>
						<SearchBar
							value={searchQuery}
							onChange={setSearchQuery}
							onSearch={handleSearch}
							onClear={handleClearSearch}
							onResultSelect={handleSelectBar}
							placeholder="Search for bars and restaurants..."
							size="lg"
							className="w-full"
							disabled={isSearching}
							results={searchResults}
							isLoading={isSearching}
							showDropdown={true}
						/>
						<p className="text-sm text-white/80">
							{selectedBar ? `Viewing calendar for ${selectedBar.name}` : "Search for a bar to load its calendar."}
						</p>
					</div>
					<Button
						type="button"
						onClick={handleAddEventClick}
						aria-haspopup="dialog"
						disabled={!selectedBar}
						className="h-12 px-8 text-base font-semibold disabled:bg-white/30 disabled:text-white/50 bg-emerald-400 hover:bg-emerald-300 text-black shadow-lg shadow-emerald-500/30"
					>
						{selectedBar ? "Add Event" : "Select a Bar"}
					</Button>
				</div>
			</header>
			<section className="flex-1 w-full px-4 pb-10 md:px-10">
				<div className="relative h-full min-h-[70vh]">
					<EventsCalendar
						month={currentMonth}
						eventsByDate={eventsByDate}
						onPrevMonth={handlePrevMonth}
						onNextMonth={handleNextMonth}
						onEventDoubleClick={handleEventDoubleClick}
						className="h-full shadow-[0_35px_80px_rgba(5,10,25,0.55)]"
					/>
					{isLoadingEvents && (
						<div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/30 backdrop-blur-sm text-sm font-semibold">
							Loading events...
						</div>
					)}
					{!selectedBar && !isLoadingEvents && (
						<div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-white/70">
							<span>Search for a bar to populate this calendar.</span>
						</div>
					)}
					{selectedBar && !isLoadingEvents && !hasEvents && (
						<div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-white/70">
							<span>No events scheduled for this bar this month. Tap Add Event to create the first one.</span>
						</div>
					)}
				</div>
			</section>

			{isFormOpen && (
				<div
					className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm px-4 py-10"
					role="dialog"
					aria-modal="true"
					aria-label={isEditing ? "Edit event" : "Create new event"}
					onClick={handleCloseForm}
				>
					<div
						className="mx-auto w-full max-w-3xl space-y-6 rounded-2xl bg-white/5 p-6 shadow-2xl shadow-black/40"
						onClick={(event) => event.stopPropagation()}
					>
						<div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
							<div>
								<p className="text-sm uppercase tracking-[0.2em] text-white/70">{isEditing ? "Edit Event" : "New Event"}</p>
								<h2 className="text-2xl font-semibold">{isEditing ? "Update the details" : "Plan something unforgettable"}</h2>
							</div>
							<Button type="button" variant="ghost" onClick={handleCloseForm} className="text-white hover:text-emerald-200">
								Close
							</Button>
						</div>
						<p className="text-sm text-white/80">
							{selectedBar ? `${isEditing ? "Editing" : "Creating"} an event for ${selectedBar.name}` : "Pick a bar to attach the event"}
						</p>
						<div className="relative">
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

									<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
													{["00", "15", "30", "45"].map((m) => (
														<option key={m} value={m}>{m}</option>
													))}
												</select>

												<select value={startAmPm} onChange={(e) => setStartAmPm(e.target.value)} className="h-9 rounded-md border border-border-light bg-white text-black px-2">
													<option value="AM">AM</option>
													<option value="PM">PM</option>
												</select>
											</div>

											<div className="mt-3">
												<Label htmlFor="start_date" className="text-foreground text-[var(--dark-sapphire)]">Start Date</Label>
												<Input id="start_date" type="text" className="mt-1 bg-white text-black placeholder:text-gray-500 border-border-light" value={formatDateToMMDDYYYY(form.start_date)} onChange={(e) => setField("start_date", parseMMDDYYYYToYYYYMMDD(e.target.value))} placeholder="MM-DD-YYYY" />
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
													{["00", "15", "30", "45"].map((m) => (
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

									<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

									<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
										<div className="space-y-2">
											<Label htmlFor="recurrence_pattern" className="text-foreground text-[var(--dark-sapphire)]">Recurrence Pattern</Label>
											<select
												id="recurrence_pattern"
												className="w-full h-10 rounded-md border border-border-light bg-white text-black px-3"
												value={form.recurrence_pattern}
												onChange={(e) => setField("recurrence_pattern", e.target.value as EventFormState["recurrence_pattern"])}
											>
												<option value="none">None</option>
												<option value="daily">Daily</option>
												<option value="weekly">Weekly</option>
												<option value="monthly">Monthly</option>
												<option value="yearly">Yearly</option>
											</select>
										</div>
										{form.recurrence_pattern === "weekly" && (
											<div className="space-y-2">
												<Label className="text-foreground text-[var(--dark-sapphire)]">Recurrence Days</Label>
												<div className="flex gap-1">
													{([0, 1, 2, 3, 4, 5, 6] as number[]).map((d, idx) => {
														const active = form.recurrence_days.includes(d)
														const letters = ["S", "M", "T", "W", "T", "F", "S"]
														return (
															<Button
																key={d}
																type="button"
																onClick={() => toggleRecurrenceDay(d)}
																className={
																	`h-8 w-8 flex items-center justify-center rounded-full text-xs font-medium transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ` +
																	(active
																			? "bg-accent text-white"
																			: "bg-white text-[var(--dark-sapphire)] border border-border-light")
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

									{form.recurrence_pattern !== "none" && (
										<div className="space-y-2">
											<Label className="text-foreground text-[var(--dark-sapphire)]">Recurrence End</Label>
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
													type="text"
													className="w-44 bg-white text-black placeholder:text-gray-500 border-border-light"
													value={formatDateToMMDDYYYY(form.recurrence_end_date)}
													onChange={(e) => setField("recurrence_end_date", parseMMDDYYYYToYYYYMMDD(e.target.value))}
													disabled={form.recurrence_end_mode !== "date"}
													placeholder="MM-DD-YYYY"
												/>
											</div>
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

									<div className="flex justify-end pt-2">
										<Button
											type="button"
											onClick={handleSubmit}
											disabled={isSubmitting || !selectedBar}
											className="bg-[var(--dark-sapphire)] hover:bg-[#0b3aa6] text-white"
										>
											{isSubmitting ? "Saving..." : isEditing ? "Update Event" : "Create Event"}
										</Button>
									</div>
								</CardContent>
							</Card>
							{isPrefillingForm && (
								<div className="absolute inset-0 rounded-2xl bg-white/80 text-[var(--dark-sapphire)] font-semibold flex items-center justify-center text-sm">
									Loading event...
								</div>
							)}
						</div>
					</div>
				</div>
			)}
			</div>

			{isDualEditModalOpen && (
				<div
					className="fixed inset-0 z-[60] overflow-y-auto bg-black/70 backdrop-blur-xl px-4 py-10"
					role="dialog"
					aria-modal="true"
					aria-label="Edit event instance"
					onClick={handleCloseDualModal}
				>
					<div
						className="relative mx-auto w-full max-w-4xl space-y-6 rounded-2xl bg-[#0d1326] p-6 text-white shadow-2xl shadow-black/50"
						onClick={(event) => event.stopPropagation()}
					>
						<div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
							<div>
								<p className="text-xs uppercase tracking-[0.2em] text-white/70">Dual Editor</p>
								<h2 className="text-2xl font-semibold">Fine-tune this experience</h2>
								{selectedCalendarEvent && (
									<p className="text-sm text-white/70">
										{selectedCalendarEvent.title} • {new Date(`${selectedCalendarEvent.date}T00:00:00`).toLocaleDateString(undefined, {
											weekday: "long",
											month: "short",
											day: "numeric",
										})}
									</p>
								)}
							</div>
							<Button type="button" variant="ghost" className="text-white hover:text-emerald-200" onClick={handleCloseDualModal}>
								Close
							</Button>
						</div>
						{dualModalError && (
							<div className="rounded-xl border border-red-400 bg-red-100/90 p-3 text-sm text-red-900">
								{dualModalError}
							</div>
						)}
						<Tabs value={activeEditTab} onValueChange={(value) => setActiveEditTab(value as "instance" | "master")}>
							<TabsList className="bg-white/10 text-white">
								<TabsTrigger value="instance" className="data-[state=active]:bg-white data-[state=active]:text-[var(--dark-sapphire)]">
									Instance
								</TabsTrigger>
								<TabsTrigger value="master" className="data-[state=active]:bg-white data-[state=active]:text-[var(--dark-sapphire)]">
									Master Event
								</TabsTrigger>
							</TabsList>
							<TabsContent value="instance" className="mt-6">
								<Card className="bg-white text-[var(--dark-sapphire)]">
									<CardContent className="space-y-4 pt-6">
										{editingMasterEventId && (
											<div className="rounded-xl border border-border-light bg-slate-50/90 p-4 text-sm text-[var(--dark-sapphire)]">
												<div className="flex flex-col gap-1">
													<p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gray-500">Master event snapshot</p>
													<p className="text-xs text-gray-500">These are the original values this instance inherits from.</p>
												</div>
												<dl className="mt-4 grid gap-4 md:grid-cols-2">
													<div className="space-y-1">
														<dt className="text-[0.65rem] uppercase tracking-wide text-gray-500">Start Time</dt>
														<dd className="text-base font-semibold">{formatTimeWithMeridiem(masterEditForm.start_time)}</dd>
													</div>
													<div className="space-y-1">
														<dt className="text-[0.65rem] uppercase tracking-wide text-gray-500">End Time</dt>
														<dd className="text-base font-semibold">{formatTimeWithMeridiem(masterEditForm.end_time)}</dd>
													</div>
													<div className="space-y-1">
														<dt className="text-[0.65rem] uppercase tracking-wide text-gray-500">Tag</dt>
														<dd className="font-semibold">{formatDisplayValue(masterTagName)}</dd>
													</div>
													<div className="space-y-1">
														<dt className="text-[0.65rem] uppercase tracking-wide text-gray-500">Name / Title</dt>
														<dd className="font-semibold">{formatDisplayValue(masterEditForm.title)}</dd>
													</div>
													<div className="space-y-1 md:col-span-2">
														<dt className="text-[0.65rem] uppercase tracking-wide text-gray-500">Description</dt>
														<dd className="text-sm text-gray-600">{formatDisplayValue(masterEditForm.description)}</dd>
													</div>
													<div className="space-y-1">
														<dt className="text-[0.65rem] uppercase tracking-wide text-gray-500">External Link</dt>
														<dd className="text-sm">
															{masterEditForm.external_link?.trim() ? (
																<a
																	href={masterEditForm.external_link}
																	target="_blank"
																	rel="noreferrer"
																	className="text-[var(--dark-sapphire)] underline break-words"
																>
																		{masterEditForm.external_link}
																	</a>
															) : (
																<span className="text-gray-500">—</span>
															)}
														</dd>
													</div>
													<div className="space-y-1">
														<dt className="text-[0.65rem] uppercase tracking-wide text-gray-500">Image URL</dt>
														<dd className="text-sm">
															{masterEditForm.image_url?.trim() ? (
																<a
																	href={masterEditForm.image_url}
																	target="_blank"
																	rel="noreferrer"
																	className="text-[var(--dark-sapphire)] underline break-words"
																>
																		{masterEditForm.image_url}
																	</a>
															) : (
																<span className="text-gray-500">—</span>
															)}
														</dd>
													</div>
												</dl>
											</div>
										)}
										<div className="grid gap-4 md:grid-cols-2">
											<div className="space-y-2">
												<Label className="text-xs font-semibold uppercase tracking-wide text-[var(--dark-sapphire)]">Start Time</Label>
												<Input type="time" value={instanceEditForm.custom_start_time} onChange={(e) => setInstanceField("custom_start_time", e.target.value)} className="bg-white text-black" />
											</div>
											<div className="space-y-2">
												<Label className="text-xs font-semibold uppercase tracking-wide text-[var(--dark-sapphire)]">End Time</Label>
												<Input type="time" value={instanceEditForm.custom_end_time} onChange={(e) => setInstanceField("custom_end_time", e.target.value)} className="bg-white text-black" />
											</div>
										</div>
										<div className="grid gap-4 md:grid-cols-2">
											<div className="space-y-2">
												<Label className="text-xs font-semibold uppercase tracking-wide text-[var(--dark-sapphire)]">Date</Label>
												<Input type="date" value={instanceEditForm.date} onChange={(e) => setInstanceField("date", e.target.value)} className="bg-white text-black" />
											</div>
											<div className="space-y-2">
												<Label className="text-xs font-semibold uppercase tracking-wide text-[var(--dark-sapphire)]">Tag Override</Label>
												<select
													className="h-10 w-full rounded-md border border-border-light bg-white px-3 text-black"
													value={instanceEditForm.custom_event_tag_id}
													onChange={(e) => setInstanceField("custom_event_tag_id", e.target.value)}
												>
													<option value="">Use master tag</option>
													{tags.map((tag) => (
														<option key={tag.id} value={tag.id}>{tag.name}</option>
													))}
												</select>
											</div>
										</div>
										<div className="space-y-2">
											<Label className="text-xs font-semibold uppercase tracking-wide text-[var(--dark-sapphire)]">Name / Title</Label>
											<Input value={instanceEditForm.custom_title} onChange={(e) => setInstanceField("custom_title", e.target.value)} placeholder="Leave blank to inherit" className="bg-white text-black" />
										</div>
										<div className="space-y-2">
											<Label className="text-xs font-semibold uppercase tracking-wide text-[var(--dark-sapphire)]">Description</Label>
											<textarea
												className="min-h-[96px] w-full rounded-md border border-border-light bg-white px-3 py-2 text-sm text-black"
												value={instanceEditForm.custom_description}
												onChange={(e) => setInstanceField("custom_description", e.target.value)}
												placeholder="Add per-instance notes"
											/>
										</div>
										<div className="grid gap-4 md:grid-cols-2">
											<div className="space-y-2">
												<Label className="text-xs font-semibold uppercase tracking-wide text-[var(--dark-sapphire)]">External Link</Label>
												<Input value={instanceEditForm.custom_external_link} onChange={(e) => setInstanceField("custom_external_link", e.target.value)} placeholder="Overrides master link" className="bg-white text-black" />
											</div>
											<div className="space-y-2">
												<Label className="text-xs font-semibold uppercase tracking-wide text-[var(--dark-sapphire)]">Image URL</Label>
												<Input value={instanceEditForm.custom_image_url} onChange={(e) => setInstanceField("custom_image_url", e.target.value)} placeholder="Overrides master artwork" className="bg-white text-black" />
											</div>
										</div>
										<div className="flex items-center gap-3 rounded-lg border border-border-light bg-gray-50 px-4 py-3">
											<input
												type="checkbox"
												className="h-4 w-4"
												checked={instanceEditForm.is_cancelled}
												onChange={(e) => setInstanceField("is_cancelled", e.target.checked)}
											/>
											<div>
												<p className="text-sm font-semibold text-[var(--dark-sapphire)]">Cancel this instance</p>
												<p className="text-xs text-gray-600">Guests won’t see this date on the calendar.</p>
											</div>
										</div>
										<div className="flex flex-wrap items-center justify-end gap-3 pt-2">
											<Button type="button" onClick={handleInstanceSubmit} disabled={isSavingInstance || isDualModalLoading} className="bg-[var(--dark-sapphire)] text-white hover:bg-[#0b3aa6]">
												{isSavingInstance ? "Saving..." : "Save Instance"}
											</Button>
										</div>
									</CardContent>
								</Card>
							</TabsContent>
							<TabsContent value="master" className="mt-6">
								{!editingMasterEventId ? (
									<div className="rounded-xl border border-border-light bg-white/80 p-6 text-center text-sm text-gray-700">
										Master event details are unavailable for this instance.
									</div>
								) : (
									<Card className="bg-white text-[var(--dark-sapphire)]">
										<CardContent className="space-y-4 pt-6">
											<div className="space-y-2">
												<Label className="text-xs font-semibold uppercase tracking-wide text-[var(--dark-sapphire)]">Event Name</Label>
												<Input value={masterEditForm.title} onChange={(e) => setMasterEditField("title", e.target.value)} className="bg-white text-black" />
											</div>
											<div className="space-y-2">
												<Label className="text-xs font-semibold uppercase tracking-wide text-[var(--dark-sapphire)]">Description</Label>
												<textarea
													className="min-h-[96px] w-full rounded-md border border-border-light bg-white px-3 py-2 text-sm text-black"
													value={masterEditForm.description}
													onChange={(e) => setMasterEditField("description", e.target.value)}
												/>
											</div>
											<div className="space-y-2">
												<Label className="text-xs font-semibold uppercase tracking-wide text-[var(--dark-sapphire)]">Event Tag</Label>
												<select
													className="h-10 w-full rounded-md border border-border-light bg-white px-3 text-black"
													value={masterEditForm.event_tag_id}
													onChange={(e) => setMasterEditField("event_tag_id", e.target.value)}
												>
													<option value="">Select a tag</option>
													{tags.map((tag) => (
														<option key={tag.id} value={tag.id}>{tag.name}</option>
													))}
												</select>
											</div>
											<div className="grid gap-4 md:grid-cols-2">
												<div className="space-y-2">
													<Label className="text-xs font-semibold uppercase tracking-wide text-[var(--dark-sapphire)]">Start Time</Label>
													<Input
														type="time"
														value={formatTimeInputValue(masterEditForm.start_time)}
														onChange={(e) => setMasterEditField("start_time", ensureTimeWithSeconds(e.target.value) ?? "")}
														className="bg-white text-black"
													/>
												</div>
												<div className="space-y-2">
													<Label className="text-xs font-semibold uppercase tracking-wide text-[var(--dark-sapphire)]">End Time</Label>
													<Input
														type="time"
														value={formatTimeInputValue(masterEditForm.end_time)}
														onChange={(e) => setMasterEditField("end_time", ensureTimeWithSeconds(e.target.value) ?? "")}
														className="bg-white text-black"
													/>
												</div>
											</div>
											<div className="grid gap-4 md:grid-cols-2">
												<div className="space-y-2">
													<Label className="text-xs font-semibold uppercase tracking-wide text-[var(--dark-sapphire)]">External Link</Label>
													<Input value={masterEditForm.external_link ?? ""} onChange={(e) => setMasterEditField("external_link", e.target.value)} placeholder="Displayed across every instance" className="bg-white text-black" />
												</div>
												<div className="space-y-2">
													<Label className="text-xs font-semibold uppercase tracking-wide text-[var(--dark-sapphire)]">Image URL</Label>
													<Input value={masterEditForm.image_url ?? ""} onChange={(e) => setMasterEditField("image_url", e.target.value)} className="bg-white text-black" />
												</div>
											</div>
											<div className="flex items-center gap-3 rounded-lg border border-border-light bg-gray-50 px-4 py-3">
												<input
													type="checkbox"
													className="h-4 w-4"
													checked={masterEditForm.is_cancelled}
													onChange={(e) => setMasterEditField("is_cancelled", e.target.checked)}
												/>
												<div>
													<p className="text-sm font-semibold text-[var(--dark-sapphire)]">Cancel the entire series</p>
													<p className="text-xs text-gray-600">Every linked instance inherits this status.</p>
												</div>
											</div>
											<div className="space-y-2">
												<Label className="text-xs font-semibold uppercase tracking-wide text-[var(--dark-sapphire)]">Recurrence Pattern</Label>
												<select
													className="h-10 w-full rounded-md border border-border-light bg-white px-3 text-black"
													value={masterEditForm.recurrence_pattern}
													onChange={(e) => setMasterEditField("recurrence_pattern", e.target.value as EventFormState["recurrence_pattern"])}
												>
													<option value="none">Does not repeat</option>
													<option value="daily">Daily</option>
													<option value="weekly">Weekly</option>
													<option value="monthly">Monthly</option>
													<option value="yearly">Yearly</option>
												</select>
											</div>
											{masterEditForm.recurrence_pattern === "weekly" && (
												<div className="space-y-2">
													<Label className="text-xs font-semibold uppercase tracking-wide text-[var(--dark-sapphire)]">Weekly on</Label>
													<div className="flex flex-wrap gap-2">
														{([0, 1, 2, 3, 4, 5, 6] as number[]).map((day, idx) => {
															const letters = ["S", "M", "T", "W", "T", "F", "S"]
															const active = masterEditForm.recurrence_days.includes(day)
															return (
																<Button
																	key={day}
																	type="button"
																	onClick={() => toggleMasterRecurrenceDay(day)}
																	className={`${active ? "bg-[var(--dark-sapphire)] text-white" : "bg-white text-[var(--dark-sapphire)] border border-border-light"} h-8 w-8 rounded-full text-xs font-semibold`}
																>
																	{letters[idx]}
																</Button>
															)
														})}
													</div>
												</div>
											)}
											{masterEditForm.recurrence_pattern !== "none" && (
												<div className="space-y-3">
													<Label className="text-xs font-semibold uppercase tracking-wide text-[var(--dark-sapphire)]">Recurrence End</Label>
													<div className={`flex flex-wrap items-center justify-between gap-4 rounded-lg border px-4 py-3 ${masterEditForm.recurrence_end_mode === "date" ? "border-[var(--dark-sapphire)] bg-[var(--dark-sapphire)]/5" : "border-border-light bg-gray-50"}`}>
														<label className="flex items-center gap-2 text-sm text-[var(--dark-sapphire)]">
															<input type="radio" name="master_end_mode" value="date" checked={masterEditForm.recurrence_end_mode === "date"} onChange={() => setMasterEditField("recurrence_end_mode", "date")} />
															<span>On date</span>
														</label>
														<Input
															type="text"
															className="w-48 bg-white text-black"
															value={formatDateToMMDDYYYY(masterEditForm.recurrence_end_date)}
															onChange={(e) => setMasterEditField("recurrence_end_date", parseMMDDYYYYToYYYYMMDD(e.target.value))}
															disabled={masterEditForm.recurrence_end_mode !== "date"}
															placeholder="MM-DD-YYYY"
														/>
													</div>
													<div className={`flex flex-wrap items-center justify-between gap-4 rounded-lg border px-4 py-3 ${masterEditForm.recurrence_end_mode === "occurrences" ? "border-[var(--dark-sapphire)] bg-[var(--dark-sapphire)]/5" : "border-border-light bg-gray-50"}`}>
														<label className="flex items-center gap-2 text-sm text-[var(--dark-sapphire)]">
															<input type="radio" name="master_end_mode" value="occurrences" checked={masterEditForm.recurrence_end_mode === "occurrences"} onChange={() => setMasterEditField("recurrence_end_mode", "occurrences")} />
															<span>After # of events</span>
														</label>
														<div className="flex items-center gap-2">
															<Input
																type="number"
																min={1}
																className="w-24 bg-white text-black"
																value={masterEditForm.recurrence_end_occurrences ?? ""}
																onChange={(e) => setMasterEditField("recurrence_end_occurrences", e.target.value ? parseInt(e.target.value, 10) : null)}
																disabled={masterEditForm.recurrence_end_mode !== "occurrences"}
															/>
															<span className="text-sm text-gray-600">occurrences</span>
														</div>
													</div>
												</div>
											)}
											<div className="flex flex-wrap items-center justify-end gap-3 pt-2">
												<Button
													type="button"
													onClick={handleMasterEditSubmit}
													disabled={isSavingMaster || isDualModalLoading}
													className="bg-[var(--dark-sapphire)] text-white hover:bg-[#0b3aa6]"
												>
													{isSavingMaster ? "Saving..." : "Save Master Event"}
												</Button>
											</div>
										</CardContent>
									</Card>
								)}
							</TabsContent>
						</Tabs>
						{isDualModalLoading && (
							<div className="absolute inset-0 rounded-2xl bg-white/70 text-center text-sm font-semibold text-[var(--dark-sapphire)]">
								<div className="flex h-full w-full items-center justify-center">Loading details...</div>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	)
}

