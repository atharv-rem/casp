import getOrganizationNameByID from "@/lib/database/organization";
import { NextRequest, NextResponse } from "next/server";
import {supabaseServerClient} from "@/lib/supabase/client";
import { redirect } from "next/navigation";

type OrganizationResponse = {
    name: string,
}

export async function GET(request: NextRequest) {
    const supabase = supabaseServerClient;

    const {data: { user },} = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
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
        const organizationName: OrganizationResponse = await getOrganizationNameByID( { orgID: OrgId });
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
