import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import getProjectAssignment from "@/lib/database/project_assignment" 

export async function GET(request:NextRequest){
    const body = await request.json();
    const projectId:string = body.projectId;
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
    try{
        const projectAssignments = await getProjectAssignment({orgId: orgId, projectId: projectId});
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