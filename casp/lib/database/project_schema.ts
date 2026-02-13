import {supabaseAdmin} from "../supabase/admin";

type ProjectField = {
    "id": string,
    "key": string,
    "type": string,
    "label": string,
    "required": boolean
}

type  ProjectSchema = {
    "field"?: ProjectField[]
}
export default async function getProjectSchema({orgId}: {orgId: string}): Promise<ProjectSchema> {
    const supabase = supabaseAdmin;
    const { data: project_schemas} = await supabase
        .from('project_schemas')
        .select('schema')
        .eq('organization_id', orgId)
        .single();
    
    return project_schemas?.schema || {};
}