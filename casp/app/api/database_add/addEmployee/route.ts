import add_employee from "@/lib/database add/addEmployee";
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
        const {custom_employee_fields, system_profile } = await request.json();
        const result = await add_employee(OrgId, system_profile, custom_employee_fields);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to add employee" },
            { status: 500 }
        );
    }
}