import { supabaseAdmin } from "@/lib/supabase/admin";
export default async function add_project(orgId: string, custom_project_fields: Record<string, any>, project_name: string) {
  const { error } = await supabaseAdmin
      .from("projects")
      .insert({
        organization_id: orgId,
        name: project_name,
        meta: custom_project_fields,
      });
    
    if (error) {
        return { success: false, error: error.message };
    }
    return { success: true };
}