"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function add_single_employee_record(prevState: any,formData: FormData) {
  const organization_id = formData.get("organization_id") as string;
  const default_employee_fields: Record<string, any> = {};
  const custom_employee_fields: Record<string, any> = {};
  const assignments: Record<string, any>[] = [];

  for (const [key, value] of formData.entries()) {
    if (key === "organization_id" || key.startsWith("$ACTION_ID_")) {
      continue;
    }

    if (key.startsWith("assignments[")) {
      const match = key.match(/assignments\[(\d+)\]\[(.+)\]/);
      if (!match) continue;

      const index = Number(match[1]);
      const field = match[2];

      assignments[index] = assignments[index] || {};
      assignments[index][field] = value;
      continue;
    }

    if (key.startsWith("system_")) {
      default_employee_fields[key.replace("system_", "")] = value;
    } else {
      custom_employee_fields[key] = value;
    }
  }
  
  const { data: employee, error } = await supabaseAdmin
    .from("employees")
    .insert({
      organization_id,
      role: "employee",
      status: "active",
      system_profile: default_employee_fields,
      custom_profile: custom_employee_fields,
      auth_user_id: null,
    })
    .select("id")
    .single();

  if (error || !employee) {
    console.error(error);
    return { success: false, error: "Failed to create employee" };
  }

  const validAssignments = assignments.filter(
    (a) => a?.project_id && a?.allocation_percentage
  );

  if (validAssignments.length > 0) {
    const rows = validAssignments.map((a) => ({
      organization_id,
      employee_id: employee.id,
      project_id: a.project_id,
      allocation_percentage: Number(a.allocation_percentage),
      start_date: a.start_date,
      end_date: a.end_date || null,
    }));

    const { error: assignError } = await supabaseAdmin
      .from("employee_project_assignments")
      .insert(rows);

    if (assignError) {
      console.error(assignError);
      return {
        success: false,
        error: "Employee created but project assignment failed",
      };
    }
  }

  return { success: true };
}


export async function add_single_project_record(prevState: any, formData: FormData) {
  try {
    const organization_id = formData.get("organization_id") as string;
    const custom_project_fields: Record<string, any> = {};
    const project_name = formData.get("project_name") as string;
    for (const [key, value] of formData.entries()) {
      if (key === "organization_id" || key === "project_name" || key.startsWith("$ACTION_ID_")) {
        continue;
      }
      custom_project_fields[key] = value;
    }
    const { error } = await supabaseAdmin
      .from("projects")
      .insert({
        organization_id,
        name: project_name,
        meta: custom_project_fields,
      });
    
    if (error) {
      console.error(error);
      return { success: false, error: "Failed to create project" };
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create project" };
  }
}

export async function add_bulk_records(formData: FormData, templateType: 'employees' | 'projects' | 'assignments' | 'all') {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const orgId = user.app_metadata?.organization_id
  if (!orgId) {
    throw new Error('Organization not found')
  }

  const [employeeSchemaRes, projectSchemaRes] = await Promise.all([
    supabaseAdmin
      .from('employee_schemas')
      .select('schema')
      .eq('organization_id', orgId)
      .single(),

    supabaseAdmin
      .from('project_schemas')
      .select('schema')
      .eq('organization_id', orgId)
      .single(),
  ])

  const employeeSchema =
    (employeeSchemaRes.data?.schema?.fields || [])
      .map((f: any) => ({ key: f.key ?? f.id }))

  const projectSchema =
    (projectSchemaRes.data?.schema?.fields || [])
      .map((f: any) => ({ key: f.key ?? f.id }))

  // Create metadata JSON object
  const metadata = {
    org_id: orgId,
    template_type: templateType,
    employee_schema: employeeSchema,
    project_schema: projectSchema,
  }

  console.log('Sending metadata:', JSON.stringify(metadata, null, 2))

  // Create new FormData with file and metadata
  const uploadFormData = new FormData()
  const file = formData.get('file')
  if (file) {
    uploadFormData.append('file', file)
  }
  uploadFormData.append('metadata', JSON.stringify(metadata))

  const res = await fetch('http://localhost:8080/upload', {
    method: 'POST',
    body: uploadFormData,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }

  return { success: true }
}



