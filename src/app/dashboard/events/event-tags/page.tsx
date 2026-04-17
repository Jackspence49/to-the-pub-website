"use client"

import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	type ChangeEvent,
	type FormEvent,
} from "react"
import { Loader2, Pencil, Plus, RefreshCw, Trash } from "lucide-react"
import { Toaster, toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"

type EventTag = {
	id: string
	name: string
	description: string | null
	color_hex: string | null
}

type TagFormState = {
	name: string
}

const ID_KEYS = ["id", "event_tag_id", "eventTagId", "uuid"] as const
const NAME_KEYS = ["name", "label", "title"] as const
const DESCRIPTION_KEYS = ["description", "details", "summary"] as const
const COLOR_KEYS = ["color_hex", "colorHex", "color", "hex", "hex_color"] as const
const COLLECTION_KEYS = ["data", "results", "items", "event_tags", "eventTags", "tags"] as const
const INPUT_STYLE =
	"bg-slate-900/70 border-white/10 text-slate-100 placeholder:text-slate-400 focus-visible:ring-amber-400/70 focus-visible:border-amber-300/70"

const buildEmptyFormState = (): TagFormState => ({
	name: "",
})

const pickString = (source: Record<string, unknown>, keys: readonly string[]): string | null => {
	for (const key of keys) {
		const value = source[key]
		if (typeof value === "string") {
			const trimmed = value.trim()
			if (trimmed) return trimmed
		}
	}
	return null
}

const pickId = (source: Record<string, unknown>, keys: readonly string[]): string | null => {
	for (const key of keys) {
		const value = source[key]
		if (typeof value === "string") {
			const trimmed = value.trim()
			if (trimmed) return trimmed
		}
		if (typeof value === "number" && Number.isFinite(value)) {
			return String(value)
		}
	}
	return null
}

const normalizeColorInput = (value?: string | null): string | null => {
	if (!value) return null
	const trimmed = value.trim()
	if (!trimmed) return null
	if (/^#?[0-9a-fA-F]{3,8}$/.test(trimmed)) {
		return trimmed.startsWith("#") ? trimmed.toUpperCase() : `#${trimmed.toUpperCase()}`
	}
	return trimmed
}

const unwrapCollection = (payload: unknown, depth = 0): unknown[] => {
	if (Array.isArray(payload)) return payload
	if (!payload || typeof payload !== "object" || depth > 2) return []
	const source = payload as Record<string, unknown>
	for (const key of COLLECTION_KEYS) {
		if (key in source) {
			const nested = unwrapCollection(source[key], depth + 1)
			if (nested.length) return nested
		}
	}
	return []
}

const coerceTag = (entry: unknown): EventTag | null => {
	if (!entry || typeof entry !== "object") return null
	const source = entry as Record<string, unknown>
	const id = pickId(source, ID_KEYS)
	if (!id) return null
	const name = pickString(source, NAME_KEYS) ?? `Tag ${id}`
	const description = pickString(source, DESCRIPTION_KEYS)
	const color = pickString(source, COLOR_KEYS)
	return {
		id,
		name,
		description: description ?? null,
		color_hex: normalizeColorInput(color),
	}
}

const normalizeEventTags = (payload: unknown): EventTag[] => {
	const collection = unwrapCollection(payload)
	const normalized = collection
		.map((entry) => coerceTag(entry))
		.filter((tag): tag is EventTag => Boolean(tag))
	if (normalized.length) return normalized
	const fallback = coerceTag(payload)
	return fallback ? [fallback] : []
}

const formStateToPayload = (state: TagFormState): Record<string, string> => ({
	name: state.name.trim(),
})

const readResponseBody = async (response: Response): Promise<unknown> => {
	const contentType = response.headers.get("content-type")?.toLowerCase() ?? ""
	if (contentType.includes("application/json")) {
		try {
			return await response.json()
		} catch {
			return null
		}
	}
	try {
		return await response.text()
	} catch {
		return null
	}
}

const extractErrorMessage = (payload: unknown, fallback: string): string => {
	if (payload && typeof payload === "object") {
		const record = payload as Record<string, unknown>
		for (const key of ["error", "message", "detail", "title"]) {
			const value = record[key]
			if (typeof value === "string") {
				const trimmed = value.trim()
				if (trimmed) return trimmed
			}
		}
	}
	if (typeof payload === "string") {
		const trimmed = payload.trim()
		if (trimmed) return trimmed
	}
	return fallback
}

export default function EventTagsPage() {
	const [tags, setTags] = useState<EventTag[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [isRefreshing, setIsRefreshing] = useState(false)
	const [isCreating, setIsCreating] = useState(false)
	const [mutationId, setMutationId] = useState<string | null>(null)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [createForm, setCreateForm] = useState<TagFormState>(() => buildEmptyFormState())
	const [editForm, setEditForm] = useState<TagFormState>(() => buildEmptyFormState())

	const sortedTags = useMemo(() => {
		return [...tags].sort((a, b) => a.name.localeCompare(b.name))
	}, [tags])

	const activeEditTag = useMemo(() => {
		return sortedTags.find((tag) => tag.id === editingId) ?? null
	}, [editingId, sortedTags])

	const fetchTags = useCallback(
		async (options?: { initial?: boolean; silent?: boolean }) => {
			const initial = options?.initial ?? false
			const silent = options?.silent ?? false
			const showRefreshState = !initial && !silent
			if (initial) setIsLoading(true)
			if (showRefreshState) setIsRefreshing(true)
			try {
				const response = await api.get(`/api/event-tags`, { requireAuth: true })
				const payload = await readResponseBody(response)
				if (!response.ok) {
					throw new Error(extractErrorMessage(payload, "Failed to fetch event tags"))
				}
				setTags(normalizeEventTags(payload))
			} catch (error) {
				const message = error instanceof Error ? error.message : "Unable to load event tags"
				toast.error("Unable to load event tags", { description: message })
			} finally {
				if (initial) setIsLoading(false)
				if (showRefreshState) setIsRefreshing(false)
			}
		},
		[]
	)

	useEffect(() => {
		void fetchTags({ initial: true })
	}, [fetchTags])

	const handleCreateFieldChange = useCallback(
		(field: keyof TagFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const { value } = event.target
			setCreateForm((prev) => ({ ...prev, [field]: value }))
		},
		[]
	)

	const handleEditFieldChange = useCallback(
		(field: keyof TagFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const { value } = event.target
			setEditForm((prev) => ({ ...prev, [field]: value }))
		},
		[]
	)

	const resetEditing = () => {
		setEditingId(null)
		setEditForm(buildEmptyFormState())
	}

	const handleStartEdit = (tag: EventTag) => {
		setEditingId(tag.id)
		setEditForm({
			name: tag.name,
		})
	}

	const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!createForm.name.trim()) {
			toast.error("Name is required")
			return
		}
		setIsCreating(true)
		try {
			const payload = formStateToPayload(createForm)
			const response = await api.post(`/api/event-tags`, payload, { requireAuth: true })
			const body = await readResponseBody(response)
			if (!response.ok) {
				throw new Error(extractErrorMessage(body, "Failed to create event tag"))
			}
			toast.success("Event tag created")
			setCreateForm(buildEmptyFormState())
			await fetchTags({ silent: true })
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unable to create tag"
			toast.error("Unable to create tag", { description: message })
		} finally {
			setIsCreating(false)
		}
	}

	const handleSaveEdit = async () => {
		if (!editingId) return
		if (!editForm.name.trim()) {
			toast.error("Name is required")
			return
		}
		setMutationId(editingId)
		try {
			const payload = formStateToPayload(editForm)
			const response = await api.put(`/api/event-tags/${editingId}`, payload, { requireAuth: true })
			const body = await readResponseBody(response)
			if (!response.ok) {
				throw new Error(extractErrorMessage(body, "Failed to update event tag"))
			}
			toast.success("Event tag updated")
			resetEditing()
			await fetchTags({ silent: true })
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unable to update tag"
			toast.error("Unable to update tag", { description: message })
		} finally {
			setMutationId(null)
		}
	}

	const handleDelete = async (tag: EventTag) => {
		const confirmed = window.confirm(`Delete the "${tag.name}" tag? This action cannot be undone.`)
		if (!confirmed) return
		setMutationId(tag.id)
		try {
			const response = await api.delete(`/api/event-tags/${tag.id}`, { requireAuth: true })
			const body = await readResponseBody(response)
			if (!response.ok) {
				throw new Error(extractErrorMessage(body, "Failed to delete event tag"))
			}
			toast.success("Event tag deleted")
			if (editingId === tag.id) {
				resetEditing()
			}
			await fetchTags({ silent: true })
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unable to delete tag"
			toast.error("Unable to delete tag", { description: message })
		} finally {
			setMutationId(null)
		}
	}

	const handleRefreshClick = () => {
		void fetchTags()
	}

	const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		void handleSaveEdit()
	}

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,_#0b1120,_#020617)] px-4 py-10 text-slate-100">
			{/* Intentional glow to move away from the sterile blue/white look. */}
			<Toaster richColors position="top-right" />
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
				<div className="space-y-3 text-center md:text-left">
					<p className="text-xs uppercase tracking-[0.4em] text-amber-300/80">Operations</p>
					<h1 className="text-4xl font-semibold tracking-tight text-white">Event tag studio</h1>
					<p className="text-base text-slate-300">
						Craft new labels, refine descriptions, and sync live color accents for every experience in the app.
					</p>
				</div>

				<div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
					<div className="space-y-6">
						<Card className="border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur">
							<CardHeader>
								<CardTitle className="text-white">Create a tag</CardTitle>
								<CardDescription className="text-slate-300">
									Give each tag a memorable name to stay consistent across the app.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleCreate} className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="new-tag-name" className="text-sm text-slate-200">
											Name *
										</Label>
										<Input
											id="new-tag-name"
											value={createForm.name}
											onChange={handleCreateFieldChange("name")}
											placeholder="e.g. Twilight Trivia"
											className={INPUT_STYLE}
											required
										/>
									</div>
									<div className="flex items-center justify-end">
										<Button
											type="submit"
											className="bg-amber-500 text-slate-950 hover:bg-amber-400"
											disabled={isCreating}
										>
											{isCreating ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Saving
												</>
											) : (
												<>
													<Plus className="mr-2 h-4 w-4" />
													Create tag
												</>
											)}
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>

						<Card className="border-white/10 bg-slate-950/40 shadow-2xl shadow-black/40 backdrop-blur">
							<CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-center md:justify-between">
								<div>
									<CardTitle className="text-white">Existing tags</CardTitle>
									<CardDescription className="text-slate-300">
										Browse the current palette and jump into edit mode with a single click.
									</CardDescription>
								</div>
								<div className="flex items-center gap-3">
									{isRefreshing && (
										<span className="flex items-center text-sm text-slate-300">
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Syncing
										</span>
									)}
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={handleRefreshClick}
										disabled={isLoading || isRefreshing}
										className="border-white/10 text-slate-100 hover:bg-white/10"
									>
										<RefreshCw className="mr-2 h-4 w-4" />
										Refresh
									</Button>
								</div>
							</CardHeader>
							<CardContent>
								{isLoading ? (
									<div className="flex items-center justify-center gap-2 py-12 text-slate-300">
										<Loader2 className="h-5 w-5 animate-spin" />
										<span>Loading event tags…</span>
									</div>
								) : sortedTags.length === 0 ? (
									<div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-sm text-slate-300">
										No event tags yet. Create your first label above to see it listed here.
									</div>
								) : (
									<ul className="space-y-3">
										{sortedTags.map((tag) => {
											const isActive = editingId === tag.id
											const isMutatingRow = mutationId === tag.id
											return (
												<li
													key={tag.id}
													className={`rounded-2xl border px-4 py-4 transition duration-200 ${
														isActive
															? "border-amber-400/80 bg-amber-100/5 shadow-[0_0_30px_rgba(251,191,36,0.15)]"
															: "border-white/5 bg-slate-900/40 hover:border-amber-200/40"
													}`}
												>
													<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
														<div className="space-y-1">
															<div className="flex flex-wrap items-center gap-3">
																<span className="text-lg font-semibold text-white">{tag.name}</span>
																{tag.color_hex && (
																	<span className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2 py-1 text-xs font-medium uppercase tracking-wide text-slate-200">
																		<span
																			className="h-4 w-4 rounded-full border border-white/30"
																			style={{ backgroundColor: tag.color_hex }}
																			aria-hidden
																		/>
																		{tag.color_hex}
																	</span>
															)}
														</div>
													</div>
													<div className="flex flex-wrap gap-2">
														<Button
															type="button"
															variant="secondary"
															className={`bg-amber-500 text-slate-950 hover:bg-amber-400 ${
																isActive ? "opacity-80" : ""
															}`}
															onClick={() => handleStartEdit(tag)}
															disabled={Boolean(isMutatingRow)}
														>
															<Pencil className="mr-2 h-3.5 w-3.5" />
															{isActive ? "Editing" : "Edit details"}
														</Button>
														<Button
															type="button"
															variant="ghost"
															className="text-rose-300 hover:bg-rose-500/10"
															onClick={() => handleDelete(tag)}
															disabled={isMutatingRow}
														>
															{isMutatingRow ? (
																<Loader2 className="h-4 w-4 animate-spin" />
															) : (
																<Trash className="h-4 w-4" />
															)}
															<span className="ml-2">Delete</span>
														</Button>
													</div>
												</div>
											</li>
										)
										})}
									</ul>
								)}
							</CardContent>
						</Card>
					</div>

						<Card className="border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur">
							<CardHeader>
								<CardTitle className="text-white">Edit details</CardTitle>
								<CardDescription className="text-slate-300">
									Select a tag to rename it, then publish the update in one click.
								</CardDescription>
							</CardHeader>
						<CardContent>
							{!activeEditTag ? (
								<div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-sm text-slate-300">
									Choose a tag on the left to start editing.
								</div>
							) : (
								<form onSubmit={handleEditSubmit} className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="edit-tag-name" className="text-sm text-slate-200">
											Name *
										</Label>
										<Input
											id="edit-tag-name"
											value={editForm.name}
											onChange={handleEditFieldChange("name")}
											placeholder="Tag name"
											className={INPUT_STYLE}
											required
										/>
									</div>
									<div className="flex flex-wrap items-center gap-3">
										<Button
											className="bg-emerald-400 text-slate-950 hover:bg-emerald-300"
											type="submit"
											disabled={mutationId === editingId}
										>
											{mutationId === editingId ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Updating
												</>
											) : (
												"Save changes"
											)}
										</Button>
										<Button
											type="button"
											variant="ghost"
											className="text-slate-200 hover:bg-white/10"
											onClick={resetEditing}
											disabled={mutationId === editingId}
										>
											Clear selection
										</Button>
									</div>
								</form>
							)}
						</CardContent>
					</Card>
				</div>
	 		</div>
			</div>
		)
}
