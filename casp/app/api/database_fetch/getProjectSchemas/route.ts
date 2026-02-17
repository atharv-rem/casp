import getProjectSchemas from "@/lib/database fetch/project_schema";
import getOrganizationID from "@/lib/database fetch/organization_id";
import { NextResponse,NextRequest } from "next/server";

type ProjectSchema = {
    "id": string,
    "key": string,
    "type": string,
    "label": string,
    "required": boolean
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
        const projectSchemas: ProjectSchema[] = await getProjectSchemas({orgId: OrgId});
        if (!projectSchemas) {
        return NextResponse.json(
            { error: "Project schemas not found" },
            { status: 404 }
        );
        }

        return NextResponse.json(projectSchemas);
    } catch (error: any) {
        return NextResponse.json(
        { error: error.message ?? "Failed to fetch project schemas" },
        { status: 500 }
        );
    }
}