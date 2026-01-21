import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const employeeId = searchParams.get("employee_id");
  const projectId = searchParams.get("project_id");

  const supabase = await createSupabaseServerClient();
  const {data:{ user } ,error: authError} = await supabase.auth.getUser();
  const organization_id = user?.app_metadata.organization_id;

  if (!employeeId || !projectId) {
    return NextResponse.json(
      { error: "employee_id and project_id are required" },
      { status: 400 }
    );
  }

  try {
    const { data: employee, error: employeeError } = await supabaseAdmin
      .from("employees")
      .select("*")
      .eq("id", employeeId)
      .single();

    if (employeeError) {
      console.error("Employee fetch error:", employeeError);
      return NextResponse.json(
        { error: "Failed to fetch employee details" },
        { status: 500 }
      );
    }

    const { data: project, error: projectError } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projectError) {
      console.error("Project fetch error:", projectError);
      return NextResponse.json(
        { error: "Failed to fetch project details" },
        { status: 500 }
      );
    }

    const { data: employeeAssignments, error: employeeAssignmentsError } = await supabaseAdmin
      .from("employee_project_assignments")
      .select(`
        id,
        start_date,
        end_date,
        allocation_percentage,
        projects!project_id (
          id,
          name,
          meta
        )
      `)
      .eq("employee_id", employeeId);

    if (employeeAssignmentsError) {
      console.error("Employee assignments fetch error:", employeeAssignmentsError);
      return NextResponse.json(
        { error: "Failed to fetch employee assignments" },
        { status: 500 }
      );
    }

    const { data: projectAssignments, error: projectAssignmentsError } = await supabaseAdmin
      .from("employee_project_assignments")
      .select(`
        id,
        start_date,
        end_date,
        allocation_percentage,
        employees!employee_id (
          id,
          role,
          status,
          system_profile,
          custom_profile
        )
      `)
      .eq("project_id", projectId);

    if (projectAssignmentsError) {
      console.error("Project assignments fetch error:", projectAssignmentsError);
      return NextResponse.json(
        { error: "Failed to fetch project assignments" },
        { status: 500 }
      );
    }

    const { data: employeeSchemaData } = await supabaseAdmin
      .from("employee_schemas")
      .select("schema")
      .eq("organization_id", organization_id)
      .single();

    const { data: projectSchemaData } = await supabaseAdmin
      .from("project_schemas")
      .select("schema")
      .eq("organization_id", organization_id)
      .single();

    return NextResponse.json({
      employee,
      project,
      employeeAssignments,
      projectAssignments,
      employeeSchema: employeeSchemaData?.schema,
      projectSchema: projectSchemaData?.schema,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
