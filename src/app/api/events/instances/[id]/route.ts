import { NextResponse } from "next/server"

// Event instance API proxy
// - GET: get individual event instance with full info
// - PUT: update a specific event instance

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  const endpoint = `${baseUrl}/events/instances/${id}`

  if (!baseUrl) {
    return NextResponse.json({ error: "API base URL is not configured." }, { status: 500 })
  }

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
    return NextResponse.json({ error: "Failed to fetch event instance from upstream.", details: String(err) }, { status: 502 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  const endpoint = `${baseUrl}/events/instances/${id}`

  if (!baseUrl) {
    return NextResponse.json({ error: "API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL" }, { status: 500 })
  }

  try {
    const payload = await request.json().catch(() => null)
    if (!payload) {
      return NextResponse.json({ error: "Request body is required" }, { status: 400 })
    }

    const authHeader = request.headers.get("Authorization")
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (authHeader) headers.Authorization = authHeader

    const res = await fetch(endpoint, { method: "PUT", headers, body: JSON.stringify(payload) })
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
