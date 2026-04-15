import getOrganizationNameByID from "@/lib/database fetch/organization";
import { NextRequest, NextResponse } from "next/server";
import getOrganizationID from "@/lib/database fetch/organization_id";
import { redis } from "@/lib/redis";

export async function GET(request: NextRequest) {
    const {OrgId, AccountName} = await getOrganizationID();
    if (!OrgId || OrgId === "cannot find organization id") {
        return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
        );
    } 

    const cacheKey = `org_name:${OrgId}`;

    try {
        const cachedName = await redis.get<string>(cacheKey);
        if (cachedName) {
            return NextResponse.json({ Organization_Name: cachedName, Account_Name: AccountName });
        }

        const organizationName: string = await getOrganizationNameByID( { orgID: OrgId });
        if (!organizationName) {
        return NextResponse.json(
            { error: "Organization not found" },
            { status: 404 }
        );
        }

        // Cache for 24 hours (24 * 60 * 60 = 86400 seconds)
        await redis.set(cacheKey, organizationName, { ex: 86400 });

        return NextResponse.json({ Organization_Name: organizationName, Account_Name: AccountName });
    } catch (error: any) {
        return NextResponse.json(
        { error: error.message ?? "Failed to fetch organization" },
        { status: 500 }
        );
    }
}
