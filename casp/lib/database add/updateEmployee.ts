import { supabaseAdmin } from "../supabase/admin";

type UpdateEmployeeResult =
    | { success: true; data: { id: string } | null }
    | { success: false; error: string }

export default async function update_employee(
    employeeId: string,
    orgId: string,
    custom_profile: any,
    system_profile: any
): Promise<UpdateEmployeeResult> {
    try {
        const { data, error } = await supabaseAdmin
            .from("employees")
            .update({ custom_profile, system_profile })
            .eq("id", employeeId)
            .eq("organization_id", orgId)
            .select("id")
            .single()

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error("Unexpected error updating employee:", error)
        return { success: false, error: "An unexpected error occurred" }
    }
}