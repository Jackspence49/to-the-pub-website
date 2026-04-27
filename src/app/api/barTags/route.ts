import { NextResponse } from "next/server"

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()

  if (!baseUrl) {
    return NextResponse.json({ error: "API base URL is not configured." }, { status: 500 })
  }

  try {
    const res = await fetch(`${baseUrl}/barTags`, { method: "GET" })

    const contentType = res.headers.get("content-type") || ""
    const body: unknown = contentType.includes("application/json")
      ? await res.json()
      : await res.text()

    return NextResponse.json(body as unknown as Record<string, unknown> | Array<unknown> | string, {
      status: res.status,
    })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch bar tags from upstream.", details: String(err) }, { status: 502 })
  }
}
