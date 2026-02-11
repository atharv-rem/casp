import {supabaseAdmin} from "../supabase/admin";

export default async function getProjectSchema({orgId}: {orgId: string}) {
    const supabase = supabaseAdmin;
    const { data: project_schemas} = await supabase
        .from('project_schemas')
        .select('schema')
        .eq('organization_id', orgId)
        .single();
    
    return project_schemas?.schema
}