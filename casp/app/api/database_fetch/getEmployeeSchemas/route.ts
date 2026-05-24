import getEmployeeSchemas from "@/lib/database fetch/employee_schema";
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
        const employeeSchemas = await getEmployeeSchemas({orgId: OrgId});
        if (!employeeSchemas) {
        return NextResponse.json(
            { error: "Employee schemas not found" },
            { status: 404 }
        );
        }

        return NextResponse.json(employeeSchemas);
    } catch (error: any) {
        return NextResponse.json(
        { error: error.message ?? "Failed to fetch employee schemas" },
        { status: 500 }
        );
    }
}