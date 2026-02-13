import { NextRequest, NextResponse } from "next/server";
import {createSupabaseServerClient} from "@/lib/supabase/server";  
import getEmployeeAssignments from "@/lib/database/employee_assignment";

export async function GET (request: NextRequest) {
    const supabase = await createSupabaseServerClient();
    const {data: { user },} = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
        );
    } 
    const orgId: string = user.app_metadata?.organization_id;
    if (!orgId) {
        return NextResponse.json(
        { error: "Missing organization id" },
        { status: 400 }
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
        const employeeAssignedToProjects = await getEmployeeAssignments({orgId: orgId, employeeId: employeeId});
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