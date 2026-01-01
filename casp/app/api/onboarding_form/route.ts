import { NextResponse } from "next/server";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { employee_schema, project_schema } = await req.json();

    const supabase = await createSupabaseServerClient();
    const {data: { user },error: authError} = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: employee, error: empError } = await supabaseAdmin
      .from("employees")
      .select("organization_id, role")
      .eq("auth_user_id", user.id)
      .single();

    if (!employee || empError) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 403 }
      );
    }

    if (employee.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can complete onboarding" },
        { status: 403 }
      );
    }

    const organization_id = employee.organization_id;

    const empInsert = await supabaseAdmin
      .from("employee_schemas")
      .upsert(
        { organization_id, schema: employee_schema },
        { onConflict: "organization_id" }
      );

    const projInsert = await supabaseAdmin
      .from("project_schemas")
      .upsert(
        { organization_id, schema: project_schema },
        { onConflict: "organization_id" }
      );

    // Set onboarding_completed to true in user's app_metadata
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { app_metadata: { onboarding_completed: true } }
    );

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update onboarding status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } 
  catch (error) {
    return NextResponse.json(
      { error: error.message || "Onboarding failed" },
      { status: 500 }
    );
  }
}
