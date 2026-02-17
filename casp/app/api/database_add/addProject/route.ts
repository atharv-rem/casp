import add_project from "@/lib/database add/addProject";
import { NextRequest, NextResponse } from "next/server";
import getOrganizationID from "@/lib/database fetch/organization_id";

export async function POST(request: NextRequest) {
    const {OrgId} = await getOrganizationID();
        if (!OrgId || OrgId === "cannot find organization id") {
            return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
            );
        } 
    try {
        const {custom_project_fields, project_name } = await request.json();
        const result = await add_project(OrgId, custom_project_fields, project_name);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to add project" },
            { status: 500 }
        );
    }
}