import {supabaseAdmin} from '../supabase/admin'

type customfields = Record<string, string>;

type Projectdetails = {
    "name": string,
    "meta": customfields
}

export default async function getProjectsByOrgId({orgId}: {orgId: string}): Promise<Projectdetails> {
    const supabase = supabaseAdmin;
    const { data: projects } = await supabase
        .from('projects')
        .select('name,meta')
        .eq('organization_id', orgId)
        .single()
  
    return {name: projects?.name || '', meta: projects?.meta || {}};
}