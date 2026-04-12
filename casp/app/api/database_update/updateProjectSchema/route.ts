import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { organization_id, schema } = body

    if (!organization_id || !schema) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("project_schemas")
      .update({ schema })
      .eq("organization_id", organization_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update project schema" },
      { status: 500 }
    )
  }
}
