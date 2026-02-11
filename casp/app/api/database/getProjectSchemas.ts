import getProjectSchemas from "@/lib/database/project_schema";
import { NextResponse } from "next/server";
import {redirect} from "next/navigation";
import { supabaseServerClient } from "@/lib/supabase/client";

type ProjectField = {
    "id": string,
    "key": string,
    "type": string,
    "label": string,
    "required": boolean
}

type  ProjectSchema = {
    "field": ProjectField[]
}

export async function GET(request: Request) {
    const supabase = await supabaseServerClient;
    
    const {data: { user },} = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }
    const OrgId: string = user.app_metadata?.organization_id;
    if (!OrgId) {
        return NextResponse.json(
        { error: "Missing organization id" },
        { status: 400 }
        );
    }
    try {
        const projectSchemas: ProjectSchema[] = await getProjectSchemas({orgId: OrgId});
        if (!projectSchemas) {
        return NextResponse.json(
            { error: "Project schemas not found" },
            { status: 404 }
        );
        }

        return NextResponse.json({ projectSchemas: projectSchemas });
    } catch (error: any) {
        return NextResponse.json(
        { error: error.message ?? "Failed to fetch project schemas" },
        { status: 500 }
        );
    }
}