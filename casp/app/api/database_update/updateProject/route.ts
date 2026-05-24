import { NextRequest, NextResponse } from "next/server"
import getOrganizationID from "@/lib/database fetch/organization_id"
import update_project from "@/lib/database add/updateProject"

type ProjectChanges = {
  name?: string
  meta?: Array<{
    id: string
    label?: string
    value: string | null
  }> | null
}

export async function PATCH(request: NextRequest) {
  const { OrgId } = await getOrganizationID()

  if (!OrgId || OrgId === "cannot find organization id") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id, changes }: { id: string; changes: ProjectChanges } =
      await request.json()

    const result = await update_project(id, OrgId, changes.meta, changes.name)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, project: result.data })
  } catch {
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    )
  }
}
