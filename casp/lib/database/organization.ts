
import { supabaseAdmin } from "../supabase/admin"

type OrganizationName = {
    "name": string
}

export default async function getOrganizationNameByID({orgID}: {orgID: string}): Promise<OrganizationName>{
    const { data: organizationName} = await supabaseAdmin
        .from("organizations")
        .select("name")
        .eq("id", orgID)
        .single()

    return organizationName?.name;
}