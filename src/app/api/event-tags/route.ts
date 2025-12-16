import { NextResponse } from "next/server"

// Proxy GET/POST for event tags to upstream API (avoids CORS on client)
export async function GET(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  const endpoint = `${baseUrl}/event-tags`

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
    return NextResponse.json({ error: "Failed to fetch event tags from upstream.", details: String(err) }, { status: 502 })
  }
}

export async function POST(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  const endpoint = `${baseUrl}/event-tags`

  if (!baseUrl) {
    return NextResponse.json({ error: "API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL" }, { status: 500 })
  }

  try {
    const payload = await request.json().catch(() => null)
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
