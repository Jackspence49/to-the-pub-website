import { NextResponse } from "next/server"

// Server-side proxy for the tags endpoint to avoid client-side CORS issues.
// It reads the external tags URL from process.env.NEXT_PUBLIC_TAGS_ENDPOINT (trimmed)
// and forwards the response to the client as JSON.
export async function GET() {
  const rawEndpoint = process.env.NEXT_PUBLIC_TAGS_ENDPOINT
  const tagsEndpoint = typeof rawEndpoint === "string" ? rawEndpoint.trim() : undefined

  if (!tagsEndpoint) {
    return NextResponse.json({ error: "Tags endpoint is not configured." }, { status: 500 })
  }

  try {
    const res = await fetch(tagsEndpoint, { method: "GET" })

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
