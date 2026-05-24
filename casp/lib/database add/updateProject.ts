import { supabaseAdmin } from "../supabase/admin"

type UpdateProjectResult =
  | { success: true; data: { id: string } | null }
  | { success: false; error: string }

type ProjectMeta = Array<{
  id: string
  label?: string
  value: string | null
}>

export default async function update_project(
  projectId: string,
  orgId: string,
  meta: ProjectMeta | null | undefined,
  name?: string
): Promise<UpdateProjectResult> {
  try {
    const updatePayload: Record<string, unknown> = {}

    if (meta !== undefined) {
      updatePayload.meta = meta
    }

    if (name !== undefined) {
      updatePayload.name = name
    }

    const { data, error } = await supabaseAdmin
      .from("projects")
      .update(updatePayload)
      .eq("id", projectId)
      .eq("organization_id", orgId)
      .select("id")
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error updating project:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
