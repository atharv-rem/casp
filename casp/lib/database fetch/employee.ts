import {supabaseAdmin} from '../supabase/admin'

type System_Profile = {
    "name": string,
    "email": string,
}
type Custom_Profile = Record<string, string>;
type EmployeeDetails = {
    id: string,
    system_profile?: System_Profile,
    custom_profile?: Custom_Profile
}

export default async function getEmployeeById({orgId}: {orgId: string}): Promise<EmployeeDetails[]> {
    const supabase = supabaseAdmin;
    const { data: employees} = await supabase
        .from('employees')
        .select('id,system_profile,custom_profile')
        .eq('organization_id', orgId)
        .neq('role', 'admin')
    return employees ?? [];
}