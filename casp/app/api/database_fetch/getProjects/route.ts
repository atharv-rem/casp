import { NextResponse,NextRequest } from "next/server";
import getProjectsByOrgId from "@/lib/database fetch/projects";
import getOrganizationID from "@/lib/database fetch/organization_id";

type customfields = Record<string, string>;

type Projectdetails = {
    "id": string,
    "name": string,
    "meta": customfields
}

export async function GET(request: NextRequest) {
    const {OrgId} = await getOrganizationID();
    if (!OrgId || OrgId === "cannot find organization id") {
        return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
        );
    } 
    
    try {
        const projects: Projectdetails[] = await getProjectsByOrgId({orgId: OrgId});
        if (!projects) {
        return NextResponse.json(
            { error: "Projects not found" },
            { status: 404 }
        );
        }   
        return NextResponse.json(projects);
    } catch (error: any) {
        return NextResponse.json(
        { error: error.message ?? "Failed to fetch projects" },
        { status: 500 }
        );
    }
}
