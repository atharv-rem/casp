import {supabaseAdmin} from "../supabase/admin";

type EmployeeField = {
    "id": string,
    "key": string,
    "type": string,
    "label": string,
    "required": boolean
}

export default async function getEmployeeSchema({orgId}: {orgId: string}): Promise<EmployeeField[]> {
    const supabase = supabaseAdmin;
    const { data: employee_schemas} = await supabase
        .from('employee_schemas')
        .select('schema')
        .eq('organization_id', orgId)
        .single()
    return employee_schemas?.schema?.fields ?? [];
}