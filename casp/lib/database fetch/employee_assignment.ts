import { supabaseAdmin } from "../supabase/admin";

export default async function getEmployeeAssignments({ orgId, employeeId }: { orgId: string, employeeId: string }){
    const supabase = supabaseAdmin;
    const { data: employee_project_assignments, error } = await supabase
            .from("employee_project_assignments")
            .select(`
                id,
                start_date,
                end_date,
                allocation_percentage,
                projects!project_id (
                id,
                name,
                meta
                )
            `)
            .eq("organization_id",orgId)
            .eq("employee_id",employeeId )
    return employee_project_assignments
}