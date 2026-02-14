import getEmployeeById from "@/lib/database/employee"
import { NextResponse,NextRequest } from "next/server";
import getOrganizationID from "@/lib/database/organization_id";

type System_Profile = {
    "name": string,
    "email": string,
} 

type Custom_Profile = Record<string, string>;

type EmployeeDetails = {
    system_profile?: System_Profile,
    custom_profile?: Custom_Profile
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
        const employee: EmployeeDetails[] = await getEmployeeById({orgId: OrgId});
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
