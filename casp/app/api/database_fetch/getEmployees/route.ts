import getEmployeeById from "@/lib/database fetch/employee"
import { NextResponse,NextRequest } from "next/server";
import getOrganizationID from "@/lib/database fetch/organization_id";

export async function GET(request: NextRequest) {
    const {OrgId} = await getOrganizationID();
    if (!OrgId || OrgId === "cannot find organization id") {
        return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
        );
    } 
    
    try {
        const employee = await getEmployeeById({orgId: OrgId});
        if (!employee) {
        return NextResponse.json(
            { error: "Employees not found" },
            { status: 404 }
        );
        }   
        return NextResponse.json(employee);
    } catch (error: any) {
        return NextResponse.json(
        { error: error.message ?? "Failed to fetch employees" },
        { status: 500 }
        );
    }
}
