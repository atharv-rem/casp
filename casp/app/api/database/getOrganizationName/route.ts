import getOrganizationNameByID from "@/lib/database/organization";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    const supabase = await createSupabaseServerClient();

    const {data: { user },} = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
        );
    } 
    const AccountName: string = user.user_metadata?.name ?? "User";
    const OrgId: string = user.app_metadata?.organization_id;  

    if (!OrgId) {
        return NextResponse.json(
        { error: "Missing organization id" },
        { status: 400 }
        );
    }

    try {
        const organizationName: string = await getOrganizationNameByID( { orgID: OrgId });
        if (!organizationName) {
        return NextResponse.json(
            { error: "Organization not found" },
            { status: 404 }
        );
        }

        return NextResponse.json({ organizationName: organizationName ?? "Organization", accountName: AccountName });
    } catch (error: any) {
        return NextResponse.json(
        { error: error.message ?? "Failed to fetch organization" },
        { status: 500 }
        );
    }
}
