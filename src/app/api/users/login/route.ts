import { NextResponse } from "next/server"

// POST proxy for login/authentication.
// Reads upstream URL from process.env.NEXT_PUBLIC_LOGIN_ENDPOINT (trimmed).
// Forwards JSON body and returns upstream response.
export async function POST(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() 
  const loginEndpoint = `${baseUrl}/users/login`

  if (!loginEndpoint) {
    try {
      const keys = Object.keys(process.env).filter((k) => k.toUpperCase().includes("LOGIN") || k.toUpperCase().includes("AUTH") || k.toUpperCase().includes("API"));
      console.error("NEXT_PUBLIC_LOGIN_ENDPOINT is missing or empty. Found env keys:", keys);
    } catch {
      // ignore logging failure
    }

    return NextResponse.json({ error: "Login endpoint is not configured. Set NEXT_PUBLIC_LOGIN_ENDPOINT in your environment or .env(.local)" }, { status: 500 })
  }

  try {
    const body = await request.json().catch(() => null)
    
    // Extract Authorization header from the incoming request
    const authHeader = request.headers.get('Authorization')
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    }
    
    // Forward the Authorization header if present (though typically not needed for login)
    if (authHeader) {
      requestHeaders.Authorization = authHeader
    }

    const res = await fetch(loginEndpoint, {
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
