import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import {redirect} from "next/navigation";
import getProjectAssignment from "@/lib/database/project_assignment" 

export async function GET(request:NextRequest){
    const { searchParams } = request.nextUrl;
    const projectId = searchParams.get("project_id");
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
    try{
        const projectAssignments = await getProjectAssignment({orgId, projectId});
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