
import { supabaseAdmin } from "../supabase/admin"

export default async function getOrganizationNameByID({orgID}: {orgID: string}): Promise<string> {
    const { data: organizationName} = await supabaseAdmin
        .from("organizations")
        .select("name")
        .eq("id", orgID)
        .single()

    return organizationName?.name;
}