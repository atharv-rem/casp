import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, changes } = body

    if (!id || !changes || typeof changes !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("employee_project_assignments")
      .update(changes)
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update assignment" },
      { status: 500 }
    )
  }
}
