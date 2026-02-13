import { NextResponse,NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import getProjectsByOrgId from "@/lib/database/projects";

type customfields = Record<string, string>;

type Projectdetails = {
    "name": string,
    "meta": customfields
}

export async function GET(request: NextRequest) {
    const supabase = await createSupabaseServerClient();
    const {data: { user },} = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
        );
    } 
    const OrgId: string = user.app_metadata?.organization_id;
    if (!OrgId) {
        return NextResponse.json(
        { error: "Missing organization id" },
        { status: 400 }
        );
    }
    try {
        const projects: Projectdetails = await getProjectsByOrgId({orgId: OrgId});
        if (!projects) {
        return NextResponse.json(
            { error: "Projects not found" },
            { status: 404 }
        );
        }   
        return NextResponse.json(projects);
    } catch (error: any) {
        return NextResponse.json(
        { error: error.message ?? "Failed to fetch projects" },
        { status: 500 }
        );
    }
}
