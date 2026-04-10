import { NextRequest, NextResponse } from "next/server"
import getOrganizationID from "@/lib/database fetch/organization_id"

const FORWARDED_PARAMS = ["live", "table", "handle", "offset", "cursor"]

export async function GET(request: NextRequest) {
  try {
    const { OrgId } = await getOrganizationID()

    if (!OrgId || OrgId === "cannot find organization id") {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 401 }
      )
    }

    const requestUrl = new URL(request.url)
    const electricUrl = new URL("https://api.electric-sql.cloud/v1/shape")

    electricUrl.searchParams.set("source_id", process.env.ELECTRIC_SOURCE_ID!)
    electricUrl.searchParams.set("table", "projects")
    electricUrl.searchParams.set("where", `organization_id='${OrgId}'`)

    requestUrl.searchParams.forEach((value, key) => {
      if (FORWARDED_PARAMS.includes(key)) {
        electricUrl.searchParams.set(key, value)
      }
    })

    if (!requestUrl.searchParams.get("offset")) {
      electricUrl.searchParams.set("offset", "-1")
    }

    const response = await fetch(electricUrl.toString(), {
      headers: {
        Authorization: `Bearer ${process.env.ELECTRIC_SECRET}`,
      },
      cache: "no-store",
    })

    const headers = new Headers(response.headers)
    headers.delete("content-encoding")
    headers.delete("content-length")

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  } catch (error) {
    console.error("Electric employee sync error:", error)

    return NextResponse.json(
      { error: "Failed to sync employees" },
      { status: 500 }
    )
  }
}
