import { NextResponse } from "next/server"

// GET endpoint for fetching individual bar details including hours
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: barId } = await params
  
  // Use your actual API structure
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:3000'
  const barEndpoint = `${baseUrl}/bars/${barId}`

  console.log("Using bar endpoint:", barEndpoint)
  console.log("Fetching bar ID:", barId)

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
      console.error("Upstream request failed:", res.status, res.statusText)
      
      // If the upstream API returns 404 or connection fails, fall back to mock data
      if (res.status === 404 || res.status >= 500) {
        console.log(`Upstream API returned ${res.status}, falling back to mock data`)
        
        // Mock bar data with hours
        const mockBar = {
          id: parseInt(barId),
          name: `Mock Bar ${barId}`,
          address_street: "123 Main St",
          address_city: "Anytown",
          address_state: "CA",
          hours: [
            { day_of_week: 0, open_time: "12:00:00", close_time: "22:00:00", is_closed: false }, // Sunday
            { day_of_week: 1, open_time: "11:00:00", close_time: "23:00:00", is_closed: false }, // Monday
            { day_of_week: 2, open_time: "11:00:00", close_time: "23:00:00", is_closed: false }, // Tuesday
            { day_of_week: 3, open_time: "11:00:00", close_time: "23:00:00", is_closed: false }, // Wednesday
            { day_of_week: 4, open_time: "11:00:00", close_time: "24:00:00", is_closed: false }, // Thursday
            { day_of_week: 5, open_time: "11:00:00", close_time: "02:00:00", is_closed: false }, // Friday
            { day_of_week: 6, open_time: "11:00:00", close_time: "02:00:00", is_closed: false }, // Saturday
          ]
        }
        
        return NextResponse.json({
          success: true,
          data: mockBar
        }, { status: 200 })
      }
      
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
        return NextResponse.json(apiResponse, { status: 200 })
      }
    }

    // Fallback - return the raw response
    return NextResponse.json(responseBody as unknown as Record<string, unknown>, {
      status: res.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (err) {
    console.error("Bar details API error:", err)
    return NextResponse.json({ 
      error: "Failed to fetch bar details", 
      details: String(err),
      endpoint: barEndpoint,
      message: "Check server logs for more details"
    }, { status: 502 })
  }
}

// PUT endpoint for updating bar details including hours
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: barId } = await params
  
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:3000'
  const barEndpoint = `${baseUrl}/bars/${barId}`

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

    const res = await fetch(barEndpoint, {
      method: "PUT",
      headers: requestHeaders,
      body: JSON.stringify(body),
    })

    const contentType = res.headers.get("content-type") || ""
    let responseBody: unknown
    
    try {
      if (contentType.includes("application/json")) {
        responseBody = await res.json()
      } else {
        responseBody = await res.text()
      }
    } catch (parseError) {
      console.error("Failed to parse upstream response:", parseError)
      responseBody = { error: "Failed to parse upstream response" }
    }

    if (!res.ok) {
      return NextResponse.json({
        error: `Failed to update bar: ${res.status} ${res.statusText}`,
        upstreamUrl: barEndpoint,
        upstreamResponse: responseBody,
      }, { status: res.status })
    }

    return NextResponse.json(responseBody as unknown as Record<string, unknown>, {
      status: res.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (err) {
    console.error("Bar update API error:", err)
    return NextResponse.json({ 
      error: "Failed to update bar", 
      details: String(err),
      endpoint: barEndpoint,
    }, { status: 502 })
  }
}