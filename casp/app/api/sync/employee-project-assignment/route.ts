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

    if (!process.env.ELECTRIC_SOURCE_ID || !process.env.ELECTRIC_SECRET) {
      return NextResponse.json(
        { error: "Missing Electric configuration" },
        { status: 500 }
      )
    }

    const requestUrl = new URL(request.url)
    const electricUrl = new URL("https://api.electric-sql.cloud/v1/shape")

    electricUrl.searchParams.set("source_id", process.env.ELECTRIC_SOURCE_ID)
    electricUrl.searchParams.set("table", "employee_project_assignments")
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

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Electric assignment sync upstream error:", response.status, errorText)

      return new Response(errorText, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          "Content-Type": response.headers.get("content-type") ?? "application/json",
        },
      })
    }

    const headers = new Headers(response.headers)
    headers.delete("content-encoding")
    headers.delete("content-length")

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  } catch (error) {
    console.error("Electric assignment sync error:", error)

    return NextResponse.json(
      { error: "Failed to sync assignments" },
      { status: 500 }
    )
  }
}
