import { supabaseAdmin } from "../supabase/admin";

type OrgId = string;

export async function fetchSummary(orgId: OrgId) {
  const { data, error } = await supabaseAdmin.rpc('get_summary_stats', {
    p_org_id: orgId,
  })
  if (error) throw error
  return data
}

export async function fetchEmployees(orgId: OrgId) {
  const { data, error } = await supabaseAdmin.rpc('get_employee_details', {
    p_org_id: orgId,
  })
  if (error) throw error
  return data
}

export async function fetchProjects(orgId: OrgId) {
  const { data, error } = await supabaseAdmin.rpc('get_project_details', {
    p_org_id: orgId,
  })
  if (error) throw error
  return data
}