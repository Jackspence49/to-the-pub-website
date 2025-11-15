import { NextResponse } from "next/server"

// GET endpoint for fetching bar information by bar ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: barId } = await params
  
  // Use your actual API structure
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:3000'
  const barEndpoint = `${baseUrl}/bars/${barId}`

  console.log("Using bar endpoint:", barEndpoint)
  console.log("Fetching bar for ID:", barId)

  try {
    // Extract Authorization header from the incoming request
    const authHeader = request.headers.get('Authorization')
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    }
    
    // Forward the Authorization header if present
    if (authHeader) {
      requestHeaders.Authorization = authHeader
      console.log("Auth header present, forwarding to upstream")
    } else {
      console.log("No auth header found")
    }

    console.log("Making upstream request...")
    const res = await fetch(barEndpoint, {
      method: "GET",
      headers: requestHeaders,
    })

    console.log("Upstream response status:", res.status)
    console.log("Upstream response ok:", res.ok)

    const contentType = res.headers.get("content-type") || ""
    console.log("Upstream content type:", contentType)
    
    let responseBody: unknown
    try {
      if (contentType.includes("application/json")) {
        responseBody = await res.json()
        console.log("Upstream JSON response:", responseBody)
      } else {
        responseBody = await res.text()
        console.log("Upstream text response:", responseBody)
      }
    } catch (parseError) {
      console.error("Failed to parse upstream response:", parseError)
      responseBody = { error: "Failed to parse upstream response", parseError: String(parseError) }
    }

    if (!res.ok) {
      return NextResponse.json({
        error: `Upstream request failed: ${res.status} ${res.statusText}`,
        upstreamUrl: barEndpoint,
        upstreamResponse: responseBody,
        details: "The upstream bar service returned an error"
      }, { status: res.status })
    }

    // Handle successful response
    if (contentType.includes("application/json")) {
      const apiResponse = responseBody as { success?: boolean; data?: unknown }
      
      if (apiResponse.success && apiResponse.data) {
        // Return just the bar data
        return NextResponse.json(apiResponse.data, { status: 200 })
      }
      
      // If response is already in the expected format, return as is
      return NextResponse.json(responseBody as unknown as Record<string, unknown>, { status: 200 })
    }

    // Fallback - return the raw response
    return NextResponse.json(responseBody as unknown as Record<string, unknown>, {
      status: res.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (err) {
    console.error("Bar API error:", err)
    return NextResponse.json({ 
      error: "Failed to fetch bar information", 
      details: String(err),
      endpoint: barEndpoint,
      message: "Check server logs for more details"
    }, { status: 502 })
  }
}

// PUT endpoint for updating bar information
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: barId } = await params
  
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:3000'
  const barEndpoint = `${baseUrl}/bars/${barId}`

  console.log("Updating bar for ID:", barId)
  console.log("Using bar endpoint:", barEndpoint)

  try {
    const body = await request.json().catch(() => null)
    
    if (!body) {
      return NextResponse.json({
        error: "Request body is required"
      }, { status: 400 })
    }

    console.log("Request body:", JSON.stringify(body, null, 2))
    
    // Extract Authorization header from the incoming request
    const authHeader = request.headers.get('Authorization')
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    }
    
    // Forward the Authorization header if present
    if (authHeader) {
      requestHeaders.Authorization = authHeader
      console.log("Auth header present, forwarding to upstream")
    } else {
      console.log("No auth header found")
    }

    console.log("Making upstream PUT request...")
    const res = await fetch(barEndpoint, {
      method: "PUT",
      headers: requestHeaders,
      body: JSON.stringify(body),
    })

    console.log("Upstream response status:", res.status)
    console.log("Upstream response ok:", res.ok)

    const contentType = res.headers.get("content-type") || ""
    console.log("Upstream content type:", contentType)
    
    let responseBody: unknown
    try {
      if (contentType.includes("application/json")) {
        responseBody = await res.json()
        console.log("Upstream JSON response:", responseBody)
      } else {
        responseBody = await res.text()
        console.log("Upstream text response:", responseBody)
      }
    } catch (parseError) {
      console.error("Failed to parse upstream response:", parseError)
      responseBody = { error: "Failed to parse upstream response", parseError: String(parseError) }
    }

    if (!res.ok) {
      return NextResponse.json({
        error: `Upstream request failed: ${res.status} ${res.statusText}`,
        upstreamUrl: barEndpoint,
        upstreamResponse: responseBody,
        details: "The upstream bar service returned an error"
      }, { status: res.status })
    }

    // Handle successful response
    if (contentType.includes("application/json")) {
      const apiResponse = responseBody as { success?: boolean; data?: unknown }
      
      if (apiResponse.success && apiResponse.data) {
        // Return just the bar data
        return NextResponse.json(apiResponse.data, { status: 200 })
      }
      
      // If response is already in the expected format, return as is
      return NextResponse.json(responseBody as unknown as Record<string, unknown>, { status: 200 })
    }

    // Fallback - return the raw response
    return NextResponse.json(responseBody as unknown as Record<string, unknown>, {
      status: res.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (err) {
    console.error("Bar update API error:", err)
    return NextResponse.json({ 
      error: "Failed to update bar information", 
      details: String(err),
      endpoint: barEndpoint,
      message: "Check server logs for more details"
    }, { status: 502 })
  }
}

