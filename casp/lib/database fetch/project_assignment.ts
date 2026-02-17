import { supabaseAdmin } from "../supabase/admin";

export default async function getProjectAssignments({orgId, projectId}: {orgId: string, projectId: string}){
    const supabase = supabaseAdmin;
    const { data: projectAssignments} = await supabase
                .from("employee_project_assignments")
                .select(`
                    id,
                    start_date,
                    end_date,
                    allocation_percentage,
                    employees!employee_id (
                    system_profile,
                    custom_profile
                    ),
                    projects!project_id (
                    id,
                    name,
                    meta
                    )
                `)
                .eq("organization_id", orgId)
                .eq("project_id", projectId);
    return projectAssignments
}