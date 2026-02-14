import getOrganizationID from "@/lib/database/organization_id";
import { NextRequest, NextResponse } from "next/server";
import getProjectAssignment from "@/lib/database/project_assignment" 

export async function GET(request:NextRequest){
    const projectId = request.nextUrl.searchParams.get("projectId");
    const {OrgId} = await getOrganizationID();
    if (!OrgId || OrgId === "cannot find organization id") {
        return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
        );
    } 
    if (!projectId) {
        return NextResponse.json(
        { error: "Missing projectId query parameter" },
        { status: 400 }
        );
    }
    try{
        const projectAssignments = await getProjectAssignment({orgId: OrgId, projectId: projectId});
        if (!projectAssignments) {
            return NextResponse.json(
                { error: "Failed to fetch project assignments" },
                { status: 500 }
            );
        }
        return NextResponse.json(projectAssignments);
    }
    catch (error: any) {
        return NextResponse.json(
        { error: error.message ?? "Failed to fetch projects assigned to employees" },
        { status: 500 }
        );
    }       
    
}