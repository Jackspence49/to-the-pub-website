import { NextResponse } from "next/server"

// POST proxy for creating bars/businesses.
// Reads upstream URL from process.env.NEXT_PUBLIC_BAR_CREATION_ENDPOINT (trimmed).
// Forwards JSON body and returns upstream response.
export async function POST(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  const barsEndpoint = `${baseUrl}/bars`


  if (!barsEndpoint) {
    // Log a helpful diagnostic to the server logs so you can debug missing config locally.
    // Avoid returning environment values to clients (security) — only return instructions.
    try {
      const keys = Object.keys(process.env).filter((k) => k.toUpperCase().includes("BAR") || k.toUpperCase().includes("API"));
      console.error("NEXT_PUBLIC_BAR_CREATION_ENDPOINT is missing or empty. Found env keys:", keys);
    } catch {
      // ignore logging failure
    }

    return NextResponse.json({ error: "Bars endpoint is not configured. Set NEXT_PUBLIC_BAR_CREATION_ENDPOINT in your environment or .env(.local)" }, { status: 500 })
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

    const res = await fetch(barsEndpoint, {
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
