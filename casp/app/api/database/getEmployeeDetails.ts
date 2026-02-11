import getEmployeeById from "@/lib/database/employee"
import { NextResponse } from "next/server";
import {redirect} from "next/navigation";
import { supabaseServerClient } from "@/lib/supabase/client";

type System_Profile = {
    "name": string,
    "email": string,
} 

type Custom_Profile = Record<string, string>;

type EmployeeDetails = {
    system_profile?: System_Profile,
    custom_profile?: Custom_Profile
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
        const employee: EmployeeDetails = await getEmployeeById({orgId: OrgId});
        if (!employee) {
        return NextResponse.json(
            { error: "Employees not found" },
            { status: 404 }
        );
        }   
        return NextResponse.json({ employee: employee });
    } catch (error: any) {
        return NextResponse.json(
        { error: error.message ?? "Failed to fetch employees" },
        { status: 500 }
        );
    }
}
