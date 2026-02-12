import { NextRequest, NextResponse } from "next/server";
import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "@/lib/supabase/server";  
import getEmployeeAssignments from "@/lib/database/employee_assignment";

export async function GET (request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const employeeId = searchParams.get("employee_id");
    const supabase = await createSupabaseServerClient();
    
    const {data: { user },} = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }
    const orgId: string = user.app_metadata?.organization_id;
    if (!orgId) {
        return NextResponse.json(
        { error: "Missing organization id" },
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