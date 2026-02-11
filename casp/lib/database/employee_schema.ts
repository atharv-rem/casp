import {supabaseAdmin} from "../supabase/admin";

export default async function getEmployeeSchema({orgId}: {orgId: string}) {
    const supabase = supabaseAdmin;
    const { data: employee_schemas} = await supabase
        .from('employee_schemas')
        .select('schema')
        .eq('organization_id', orgId)
        .single();
    
    return employee_schemas?.schema
}