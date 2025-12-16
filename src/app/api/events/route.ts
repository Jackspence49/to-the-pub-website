import { NextResponse } from "next/server"

// Events API proxy
// - POST: create a new event (master) and auto-generate instances
// - GET: list event instances with filtering and pagination

export async function POST(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  const endpoint = `${baseUrl}/events`

  if (!baseUrl) {
    return NextResponse.json({ error: "API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL" }, { status: 500 })
  }

  try {
    const payload = await request.json().catch(() => null)
    if (!payload) {
      return NextResponse.json({ error: "Request body is required" }, { status: 400 })
    }

    // Basic required field validation before proxying
    const required = ["bar_id", "title", "start_time", "end_time", "event_tag_id"]
    const missing = required.filter((k) => payload[k] == null || payload[k] === "")
    if (missing.length) {
      return NextResponse.json({ error: "Missing required fields", missing }, { status: 400 })
    }

    const authHeader = request.headers.get("Authorization")
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (authHeader) headers.Authorization = authHeader

    const res = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify(payload) })
    const contentType = res.headers.get("content-type") || ""
    const body = contentType.includes("application/json") ? await res.json() : await res.text()

    return NextResponse.json(body as unknown, {
      status: res.status,
      headers: { "Access-Control-Allow-Origin": "*" },
    })
  } catch (err) {
    return NextResponse.json({ error: "Failed to forward request to upstream.", details: String(err) }, { status: 502 })
  }
}

// GET /api/events
// Query Params: bar_id, event_tag_id, date_from, date_to, upcoming, page, limit
export async function GET(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  if (!baseUrl) {
    return NextResponse.json({ error: "API base URL is not configured." }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const query = new URLSearchParams()

  const allowed = [
    "bar_id",
    "event_tag_id",
    "date_from",
    "date_to",
    "upcoming",
    "page",
    "limit",
  ]

  for (const key of allowed) {
    const val = searchParams.get(key)
    if (val !== null && val !== "") query.set(key, val)
  }

  const endpoint = `${baseUrl}/events${query.toString() ? `?${query.toString()}` : ""}`

  try {
    const authHeader = request.headers.get("Authorization")
    const headers: Record<string, string> = {}
    if (authHeader) headers.Authorization = authHeader

    const res = await fetch(endpoint, { method: "GET", headers })
    const contentType = res.headers.get("content-type") || ""
    const body = contentType.includes("application/json") ? await res.json() : await res.text()

    return NextResponse.json(body as unknown, {
      status: res.status,
      headers: { "Access-Control-Allow-Origin": "*" },
    })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch events from upstream.", details: String(err) }, { status: 502 })
  }
}
