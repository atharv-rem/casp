import { supabaseAdmin } from "@/lib/supabase/admin";

type assignment = {
    organization_id: string;
    employee_id: string;
    project_id: string;
    allocation_percentage: number;
    start_date: string;
    end_date?: string | null;
}

export type Assignment = assignment;

export default async function add_assignment(orgId: string, assignments: Assignment[]) {
    const rows = assignments.map((assignment) => ({
        organization_id: assignment.organization_id || orgId,
        employee_id: assignment.employee_id,
        project_id: assignment.project_id,
        allocation_percentage: assignment.allocation_percentage,
        start_date: assignment.start_date,
        end_date: assignment.end_date || null,
    }));

    const { error } = await supabaseAdmin
        .from("employee_project_assignments")
        .insert(rows)
    
    if (error) {
        return { success: false, error: error.message };
    }
    return { success: true };
}