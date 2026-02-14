import getOrganizationNameByID from "@/lib/database/organization";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import getOrganizationID from "@/lib/database/organization_id";

export async function GET(request: NextRequest) {
    const {OrgId, AccountName} = await getOrganizationID();
    if (!OrgId || OrgId === "cannot find organization id") {
        return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
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

        return NextResponse.json({ Organization_Name: organizationName, Account_Name: AccountName });
    } catch (error: any) {
        return NextResponse.json(
        { error: error.message ?? "Failed to fetch organization" },
        { status: 500 }
        );
    }
}
