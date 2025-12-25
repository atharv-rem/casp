import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { organization_id, employee_schema, project_schema } = await req.json();

    if (!organization_id) {
      return NextResponse.json(
        { error: "Missing organization identifier" },
        { status: 400 }
      );
    }

    const { error: empSchemaError } = await supabaseAdmin
      .from("employee_schemas")
      .upsert(
        {
          organization_id,
          schema: employee_schema,
        },
        { onConflict: "organization_id" }
      );

    if (empSchemaError) {
      console.error("Employee schema upsert failed", empSchemaError);
      return NextResponse.json(
        { error: empSchemaError.message },
        { status: 500 }
      );
    }

    const { error: projSchemaError } = await supabaseAdmin
      .from("project_schemas")
      .upsert(
        {
          organization_id,
          schema: project_schema,
        },
        { onConflict: "organization_id" }
      );

    if (projSchemaError) {
      console.error("Project schema upsert failed", projSchemaError);
      return NextResponse.json(
        { error: projSchemaError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error", error);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
