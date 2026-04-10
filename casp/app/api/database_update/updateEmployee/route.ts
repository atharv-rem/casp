import { NextRequest, NextResponse } from "next/server"
import getOrganizationID from "@/lib/database fetch/organization_id"
import update_employee from "@/lib/database add/updateEmployee"

type EmployeeChanges = {
  system_profile?: {
    name?: string
    email?: string
  } | null
  custom_profile?: Array<{
    id: string
    label?: string
    value: string | null
  }> | null
  role?: string
  status?: string
}

export async function PATCH(request: NextRequest) {
  const { OrgId } = await getOrganizationID()

  if (!OrgId || OrgId === "cannot find organization id") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id, changes }: { id: string; changes: EmployeeChanges } =
      await request.json()

    const result = await update_employee(
      id,
      OrgId,
      changes.custom_profile,
      changes.system_profile,
      changes.role,
      changes.status
    )

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, employee: result.data })
  } 
  catch (error) {
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    )
  }
}
