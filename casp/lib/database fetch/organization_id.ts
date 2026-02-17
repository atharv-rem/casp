import { createSupabaseServerClient } from "../supabase/server";
export default async function getOrganizationID() {
    const supabase = await createSupabaseServerClient();
    const {data: { user },} = await supabase.auth.getUser();
    const OrgId: string = user?.app_metadata?.organization_id;
    const AccountName: string = user?.user_metadata?.name;
    const OrganizationName: string = user?.user_metadata?.organization_name;
    return {OrgId: OrgId || "cannot find organization id",AccountName: AccountName || "cannot find account name", OrganizationName: OrganizationName || "cannot find organization name"};
} 