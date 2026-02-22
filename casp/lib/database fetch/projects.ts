import {supabaseAdmin} from '../supabase/admin'

export default async function getProjectsByOrgId({orgId}: {orgId: string}) {
    const supabase = supabaseAdmin;
    const { data: projects, error } = await supabase
        .from('projects')
        .select('id,name,meta')
        .eq('organization_id', orgId)

    if (error) {
        throw new Error(error.message)
    }
  
    return projects ?? [];
}