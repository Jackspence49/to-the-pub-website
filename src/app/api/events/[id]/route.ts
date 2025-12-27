import { NextResponse } from "next/server"

type RouteContext = { params: Promise<{ id: string }> }

const requireBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  if (!baseUrl) {
    throw new Error("API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL")
  }
  return baseUrl
}

const buildHeaders = (request: Request, includeJson = false) => {
  const headers: Record<string, string> = {}
  const authHeader = request.headers.get("Authorization")
  if (authHeader) headers.Authorization = authHeader
  if (includeJson) headers["Content-Type"] = "application/json"
  return headers
}

const proxyRequest = async (request: Request, method: "GET" | "PATCH" | "PUT" | "DELETE", id: string, body?: unknown) => {
  const baseUrl = requireBaseUrl()
  const endpoint = `${baseUrl}/events/${id}`
  const headers = buildHeaders(request, method !== "GET")

  const upstream = await fetch(endpoint, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const contentType = upstream.headers.get("content-type") || ""
  const responseBody = contentType.includes("application/json") ? await upstream.json() : await upstream.text()

  return NextResponse.json(responseBody as unknown, {
    status: upstream.status,
    headers: { "Access-Control-Allow-Origin": "*" },
  })
}

const parseJsonBody = async (request: Request) => {
  const payload = await request.json().catch(() => null)
  if (!payload) {
    throw new Error("Request body is required")
  }
  return payload
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    return await proxyRequest(request, "GET", id)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch event", details: String(error) },
      { status: 502 }
    )
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const payload = await parseJsonBody(request)
    const { id } = await params
    return await proxyRequest(request, "PATCH", id, payload)
  } catch (error) {
    const status = String(error).includes("Request body is required") ? 400 : 502
    return NextResponse.json(
      { error: "Failed to update event", details: String(error) },
      { status }
    )
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const payload = await parseJsonBody(request)
    const { id } = await params
    return await proxyRequest(request, "PUT", id, payload)
  } catch (error) {
    const status = String(error).includes("Request body is required") ? 400 : 502
    return NextResponse.json(
      { error: "Failed to replace event", details: String(error) },
      { status }
    )
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    return await proxyRequest(request, "DELETE", id)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete event", details: String(error) },
      { status: 502 }
    )
  }
}
