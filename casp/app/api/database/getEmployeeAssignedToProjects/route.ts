import { NextRequest, NextResponse } from "next/server";
import getOrganizationID from "@/lib/database/organization_id";
import getEmployeeAssignments from "@/lib/database/employee_assignment";

export async function GET (request: NextRequest) {
    const {OrgId} = await getOrganizationID();
    if (!OrgId || OrgId === "cannot find organization id") {
        return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
        );
    } 

    const employeeId = request.nextUrl.searchParams.get("employeeId");
    if (!employeeId) {
        return NextResponse.json(
        { error: "Missing employeeId query parameter" },
        { status: 400 }
        );
    }

    try {        
        const employeeAssignedToProjects = await getEmployeeAssignments({orgId: OrgId, employeeId: employeeId});
        if (!employeeAssignedToProjects) {
        return NextResponse.json(
            { error: "Employee assignments not found" },    
            { status: 404 });
        }
        return NextResponse.json(employeeAssignedToProjects);
    }
    catch (error: any) {
        return NextResponse.json(
        { error: error.message ?? "Failed to fetch employee assigned to projects" },
        { status: 500 }
        );
    }
} 