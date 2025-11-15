import { NextResponse } from "next/server"

// Server-side proxy for the tags endpoint to avoid client-side CORS issues.
// It reads the external tags URL from process.env.NEXT_PUBLIC_API_BASE_URL (trimmed)
// and forwards the response to the client as JSON.
export async function GET(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() 
  const tagsEndpoint = `${baseUrl}/tags`

  if (!baseUrl) {
    return NextResponse.json({ error: "API base URL is not configured." }, { status: 500 })
  }

  try {
    // Extract Authorization header from the incoming request
    const authHeader = request.headers.get('Authorization')
    const requestHeaders: Record<string, string> = {}
    
    // Forward the Authorization header if present
    if (authHeader) {
      requestHeaders.Authorization = authHeader
    }

    const res = await fetch(tagsEndpoint, { 
      method: "GET",
      headers: requestHeaders
    })

    const contentType = res.headers.get("content-type") || ""
    let body: unknown
    if (contentType.includes("application/json")) {
      body = await res.json()
    } else {
      // If the upstream returns plain text or other types, return as text under `data`.
      body = await res.text()
    }

    // NextResponse.json expects `any` as the body type; keep the internal type unknown then
    // provide it to NextResponse.json (the cast is localized and intentional).
    return NextResponse.json(body as unknown as Record<string, unknown> | Array<unknown> | string, {
      status: res.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch tags from upstream.", details: String(err) }, { status: 502 })
  }
}

// POST proxy for creating tags.
// Reads upstream URL from process.env.NEXT_PUBLIC_API_BASE_URL and appends /tags.
// Forwards JSON body and returns upstream response.
export async function POST(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() 
  const tagsEndpoint = `${baseUrl}/tags`

  if (!baseUrl) {
    return NextResponse.json({ error: "API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL in your environment or .env(.local)" }, { status: 500 })
  }

  try {
    const body = await request.json().catch(() => null)
    
    // Extract Authorization header from the incoming request
    const authHeader = request.headers.get('Authorization')
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    }
    
    // Forward the Authorization header if present
    if (authHeader) {
      requestHeaders.Authorization = authHeader
    }

    const res = await fetch(tagsEndpoint, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(body),
    })

    const contentType = res.headers.get("content-type") || ""
    let responseBody: unknown
    if (contentType.includes("application/json")) {
      responseBody = await res.json()
    } else {
      responseBody = await res.text()
    }

    return NextResponse.json(responseBody as unknown as Record<string, unknown> | Array<unknown> | string, {
      status: res.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (err) {
    return NextResponse.json({ error: "Failed to forward request to upstream.", details: String(err) }, { status: 502 })
  }
}
