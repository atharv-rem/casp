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

    console.log("Employee row:", employee);
    console.log("Employee error:", empError);

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
    console.log("Resolved organization_id:", organization_id)

    const empInsert = await supabaseAdmin
      .from("employee_schemas")
      .upsert(
        { organization_id, schema: employee_schema },
        { onConflict: "organization_id" }
      );

    console.log("Employee schema insert result:", empInsert);

    const projInsert = await supabaseAdmin
      .from("project_schemas")
      .upsert(
        { organization_id, schema: project_schema },
        { onConflict: "organization_id" }
      );

    console.log("Project schema insert result:", projInsert);

    return NextResponse.json({ success: true });
  } 
  catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
