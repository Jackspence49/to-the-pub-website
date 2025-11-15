import { NextResponse } from "next/server"

// PUT endpoint for updating a tag by ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  console.log("=== PUT /api/tags/[id] ===")
  console.log("Tag ID:", id)
  console.log("Request URL:", request.url)
  
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  const tagsEndpoint = `${baseUrl}/tags/${id}`

  console.log("Base URL:", baseUrl)
  console.log("Tags endpoint:", tagsEndpoint)

  if (!baseUrl) {
    return NextResponse.json(
      { error: "API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL in your environment or .env(.local)" },
      { status: 500 }
    )
  }

  try {
    const body = await request.json().catch(() => null)
    console.log("Request body:", body)
    
    if (!body) {
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 }
      )
    }

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

    console.log("Making upstream request to:", tagsEndpoint)
    console.log("Request method: PUT")
    console.log("Request headers:", requestHeaders)
    
    const res = await fetch(tagsEndpoint, {
      method: "PUT",
      headers: requestHeaders,
      body: JSON.stringify(body),
    })

    console.log("Upstream response status:", res.status)
    console.log("Upstream response ok:", res.ok)

    const contentType = res.headers.get("content-type") || ""
    let responseBody: unknown
    if (contentType.includes("application/json")) {
      responseBody = await res.json()
      console.log("Upstream JSON response:", responseBody)
    } else {
      responseBody = await res.text()
      console.log("Upstream text response:", responseBody)
    }

    return NextResponse.json(
      responseBody as unknown as Record<string, unknown> | Array<unknown> | string,
      {
        status: res.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
  } catch (err) {
    console.error("Error in PUT /api/tags/[id]:", err)
    return NextResponse.json(
      { error: "Failed to forward request to upstream.", details: String(err) },
      { status: 502 }
    )
  }
}

// DELETE endpoint for deleting a tag by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  console.log("=== DELETE /api/tags/[id] ===")
  console.log("Tag ID:", id)
  console.log("Request URL:", request.url)
  
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  const tagsEndpoint = `${baseUrl}/tags/${id}`

  console.log("Base URL:", baseUrl)
  console.log("Tags endpoint:", tagsEndpoint)

  if (!baseUrl) {
    return NextResponse.json(
      { error: "API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL in your environment or .env(.local)" },
      { status: 500 }
    )
  }

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

    console.log("Making upstream request to:", tagsEndpoint)
    console.log("Request method: DELETE")
    console.log("Request headers:", requestHeaders)
    
    const res = await fetch(tagsEndpoint, {
      method: "DELETE",
      headers: requestHeaders,
    })

    console.log("Upstream response status:", res.status)
    console.log("Upstream response ok:", res.ok)

    const contentType = res.headers.get("content-type") || ""
    let responseBody: unknown
    if (contentType.includes("application/json")) {
      responseBody = await res.json()
      console.log("Upstream JSON response:", responseBody)
    } else {
      responseBody = await res.text()
      console.log("Upstream text response:", responseBody)
    }

    return NextResponse.json(
      responseBody as unknown as Record<string, unknown> | Array<unknown> | string,
      {
        status: res.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
  } catch (err) {
    console.error("Error in DELETE /api/tags/[id]:", err)
    return NextResponse.json(
      { error: "Failed to forward request to upstream.", details: String(err) },
      { status: 502 }
    )
  }
}

