import { NextResponse } from "next/server"

// GET endpoint for fetching bar tags by bar ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: barId } = await params
  
  // Use your actual API structure
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:3000'
  const tagsEndpoint = `${baseUrl}/bars/${barId}/tags`

  console.log("Using tags endpoint:", tagsEndpoint)
  console.log("Fetching tags for bar ID:", barId)

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
    const res = await fetch(tagsEndpoint, {
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
        upstreamUrl: tagsEndpoint,
        upstreamResponse: responseBody,
        details: "The upstream bar tags service returned an error"
      }, { status: res.status })
    }

    // Handle successful response
    if (contentType.includes("application/json")) {
      const apiResponse = responseBody as { success?: boolean; data?: unknown }
      
      if (apiResponse.success && apiResponse.data) {
        // Return just the tags data
        return NextResponse.json(apiResponse.data, { status: 200 })
      }
      
      // If response is already in the expected format (array of tags), return as is
      if (Array.isArray(responseBody)) {
        return NextResponse.json(responseBody, { status: 200 })
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
    console.error("Bar tags API error:", err)
    return NextResponse.json({ 
      error: "Failed to fetch bar tags", 
      details: String(err),
      endpoint: tagsEndpoint,
      message: "Check server logs for more details"
    }, { status: 502 })
  }
}

// POST endpoint for adding a tag to a bar
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: barId } = await params
  
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:3000'

  console.log("Adding tag to bar ID:", barId)

  // Declare tagsEndpoint here so it's available in the catch block for better diagnostics
  let tagsEndpoint: string | undefined = undefined

  try {
    const body = await request.json().catch(() => null)
    
    if (!body) {
      return NextResponse.json({
        error: "Request body is required"
      }, { status: 400 })
    }

    // Extract tag_id from request body
    const tagId = body.tag_id || body.tagId
    if (!tagId) {
      return NextResponse.json({
        error: "tag_id is required in request body"
      }, { status: 400 })
    }

    // Construct endpoint with tagId in the path: /bars/:barID/tags/:tagID
    tagsEndpoint = `${baseUrl}/bars/${barId}/tags/${tagId}`

    console.log("Request body:", JSON.stringify(body, null, 2))
    console.log("Using tags endpoint:", tagsEndpoint)
    
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

    console.log("Making upstream POST request...")
    const res = await fetch(tagsEndpoint, {
      method: "POST",
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
        error: `Failed to add tag to bar: ${res.status} ${res.statusText}`,
        upstreamUrl: tagsEndpoint,
        upstreamResponse: responseBody,
        details: "The upstream bar tags service returned an error"
      }, { status: res.status })
    }

    // Handle successful response
    if (contentType.includes("application/json")) {
      const apiResponse = responseBody as { success?: boolean; data?: unknown }
      
      if (apiResponse.success) {
        return NextResponse.json(apiResponse, { status: 200 })
      }
    }

    // Return the response as-is
    return NextResponse.json(responseBody as unknown as Record<string, unknown>, {
      status: res.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (err) {
    console.error("Bar tag add API error:", err)
    return NextResponse.json({ 
      error: "Failed to add tag to bar", 
      details: String(err),
      endpoint: tagsEndpoint,
      message: "Check server logs for more details"
    }, { status: 502 })
  }
}

// DELETE endpoint for removing a tag from a bar
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: barId } = await params
  
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:3000'
  
  // Extract tag_id from query params
  const url = new URL(request.url)
  const tagId = url.searchParams.get('tag_id') || url.searchParams.get('tagId')
  
  if (!tagId) {
    return NextResponse.json({
      error: "tag_id query parameter is required"
    }, { status: 400 })
  }
  
  const tagsEndpoint = `${baseUrl}/bars/${barId}/tags/${tagId}`

  console.log("Removing tag from bar ID:", barId)
  console.log("Tag ID:", tagId)
  console.log("Using tags endpoint:", tagsEndpoint)

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

    console.log("Making upstream DELETE request...")
    const res = await fetch(tagsEndpoint, {
      method: "DELETE",
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
        error: `Failed to remove tag from bar: ${res.status} ${res.statusText}`,
        upstreamUrl: tagsEndpoint,
        upstreamResponse: responseBody,
        details: "The upstream bar tags service returned an error"
      }, { status: res.status })
    }

    // Handle successful response
    if (contentType.includes("application/json")) {
      const apiResponse = responseBody as { success?: boolean; data?: unknown }
      
      if (apiResponse.success) {
        return NextResponse.json(apiResponse, { status: 200 })
      }
    }

    // Return the response as-is
    return NextResponse.json(responseBody as unknown as Record<string, unknown>, {
      status: res.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (err) {
    console.error("Bar tag delete API error:", err)
    return NextResponse.json({ 
      error: "Failed to remove tag from bar", 
      details: String(err),
      endpoint: tagsEndpoint,
      message: "Check server logs for more details"
    }, { status: 502 })
  }
}

