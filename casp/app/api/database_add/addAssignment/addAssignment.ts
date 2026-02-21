import add_assignment from "@/lib/database add/addAssignment";
import type { Assignment } from "@/lib/database add/addAssignment";
import { NextRequest, NextResponse } from "next/server";
import getOrganizationID from "@/lib/database fetch/organization_id";

type AddAssignmentBody = {
    custom_assignment_fields: Assignment | Assignment[];
}

function isAssignment(value: unknown): value is Assignment {
    if (!value || typeof value !== "object") {
        return false;
    }

    const assignment = value as Record<string, unknown>;
    return (
        typeof assignment.employee_id === "string" &&
        typeof assignment.project_id === "string" &&
        typeof assignment.allocation_percentage === "number" &&
        typeof assignment.start_date === "string" &&
        (assignment.end_date === undefined || assignment.end_date === null || typeof assignment.end_date === "string") &&
        (assignment.organization_id === undefined || typeof assignment.organization_id === "string")
    );
}

export async function POST(request: NextRequest) {
    const {OrgId} = await getOrganizationID();
        if (!OrgId || OrgId === "cannot find organization id") {
            return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
            );
        } 
    try {
        const body = await request.json() as AddAssignmentBody;
        const rawAssignments = body.custom_assignment_fields;
        const assignments = Array.isArray(rawAssignments) ? rawAssignments : [rawAssignments];

        if (assignments.length === 0 || !assignments.every(isAssignment)) {
            return NextResponse.json(
                { error: "Invalid assignment payload" },
                { status: 400 }
            );
        }

        const result = await add_assignment(OrgId, assignments);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to add assignment" },
            { status: 500 }
        );
    }
}