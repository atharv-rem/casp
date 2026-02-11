import getEmployeeSchemas from "@/lib/database/employee_schema";
import { NextResponse } from "next/server";
import {redirect} from "next/navigation";
import { supabaseServerClient } from "@/lib/supabase/client";

type EmployeeField = {
    "id": string,
    "key": string,
    "type": string,
    "label": string,
    "required": boolean
}

type  EmployeeSchema = {
    "field": EmployeeField[]
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
        const employeeSchemas: EmployeeSchema[] = await getEmployeeSchemas({orgId: OrgId});
        if (!employeeSchemas) {
        return NextResponse.json(
            { error: "Employee schemas not found" },
            { status: 404 }
        );
        }

        return NextResponse.json({ employeeSchemas: employeeSchemas });
    } catch (error: any) {
        return NextResponse.json(
        { error: error.message ?? "Failed to fetch employee schemas" },
        { status: 500 }
        );
    }
}