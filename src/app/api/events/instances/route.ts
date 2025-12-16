import { NextResponse } from "next/server"

// GET /api/events/instances
// Query Params: bar_id, date_from, date_to, upcoming, tag_ids, page, limit
export async function GET(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  if (!baseUrl) {
    return NextResponse.json({ error: "API base URL is not configured." }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const query = new URLSearchParams()

  const allowed = [
    "bar_id",
    "date_from",
    "date_to",
    "upcoming",
    "tag_ids",
    "page",
    "limit",
  ]

  for (const key of allowed) {
    const val = searchParams.get(key)
    if (val !== null && val !== "") query.set(key, val)
  }

  const endpoint = `${baseUrl}/events/instances${query.toString() ? `?${query.toString()}` : ""}`

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
    return NextResponse.json({ error: "Failed to fetch event instances from upstream.", details: String(err) }, { status: 502 })
  }
}
