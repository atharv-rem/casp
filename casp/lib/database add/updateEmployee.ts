import { supabaseAdmin } from "../supabase/admin"

type UpdateEmployeeResult =
  | { success: true; data: { id: string } | null }
  | { success: false; error: string }

export default async function update_employee(
  employeeId: string,
  orgId: string,
  custom_profile: any,
  system_profile: any,
  role?: string,
  status?: string
): Promise<UpdateEmployeeResult> {
  try {
    const updatePayload: Record<string, unknown> = {}

    if (custom_profile !== undefined) {
      updatePayload.custom_profile = custom_profile
    }

    if (system_profile !== undefined) {
      updatePayload.system_profile = system_profile
    }

    if (role !== undefined) {
      updatePayload.role = role
    }

    if (status !== undefined) {
      updatePayload.status = status
    }

    const { data, error } = await supabaseAdmin
      .from("employees")
      .update(updatePayload)
      .eq("id", employeeId)
      .eq("organization_id", orgId)
      .select("id")
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } 
  catch (error) {
    console.error("Unexpected error updating employee:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
