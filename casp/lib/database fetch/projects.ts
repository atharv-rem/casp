import {supabaseAdmin} from '../supabase/admin'

type customfields = Record<string, string>;

type Projectdetails = {
    "id": string,
    "name": string,
    "meta": customfields
}

export default async function getProjectsByOrgId({orgId}: {orgId: string}): Promise<Projectdetails[]> {
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