import getOrganizationID from "@/lib/database fetch/organization_id";
import { NextResponse,NextRequest } from "next/server";
import update_employee from "@/lib/database add/updateEmployee";

type Employee = {
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
    const {OrgId} = await getOrganizationID();
        if (!OrgId || OrgId === "cannot find organization id") {
            return NextResponse.json(
            {error: "Unauthorized" },
            { status: 401 }
        );} 
    try {
        const { id, changes }: { id: string; changes: Employee} = await request.json()
        const updatePayload: Record<string, unknown> = {}
        if ("system_profile" in changes) {
            updatePayload.system_profile = changes.system_profile
        }

        if ("custom_profile" in changes) {
            updatePayload.custom_profile = changes.custom_profile
        }

        if ("role" in changes) {
            updatePayload.role = changes.role
        }

        if ("status" in changes) {
            updatePayload.status = changes.status
        }

        const result = await update_employee(id, OrgId, updatePayload.custom_profile , updatePayload.system_profile)
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