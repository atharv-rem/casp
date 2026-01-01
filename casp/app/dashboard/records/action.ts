"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function add_single_employee_record(formData: FormData) {
  const organization_id = formData.get("organization_id") as string;

  const system_profile: Record<string, any> = {};
  const custom_profile: Record<string, any> = {};

  for (const [key, value] of formData.entries()) {
  if (key === "organization_id" || key.startsWith("$ACTION_ID_")) {
    continue;
  }
  if (key.startsWith("system_")) {
    system_profile[key.replace("system_", "")] = value;
  } else {
    custom_profile[key] = value;
  }
}


  const { error } = await supabaseAdmin
    .from("employees")
    .insert({
      organization_id,
      role: "employee",
      status: "active",
      system_profile,
      custom_profile,
      auth_user_id: null
    });

  if (error) {
    console.error(error);
    throw new Error("Failed to create employee");
  }
}

export async function add_single_project_record(formData: FormData) {
  const organization_id = formData.get("organization_id") as string;
  const meta: Record<string, any> = {};
  const name = formData.get("project_name") as string;
  for (const [key, value] of formData.entries()) {
    if (key === "organization_id" || key === "project_name" || key.startsWith("$ACTION_ID_")) {
      continue;
    }
    meta[key] = value;
  }
  const { error } = await supabaseAdmin
    .from("projects")
    .insert({
      organization_id,
      name,
      meta,
    });

  if (error) {
    console.error(error);
    throw new Error("Failed to create project");
  }
}

export async function add_multiple_employee_records(formData: FormData,excelHeaders: string[]) {
  const supabase = await createSupabaseServerClient()
  const {data: { user }} = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  const orgId = user.app_metadata?.organization_id
  if (!orgId) {
    throw new Error('Organization not found')
  }

  const { data, error } = await supabaseAdmin
    .from('employee_schemas')
    .select('schema')
    .eq('organization_id', orgId)
    .single()

  if (error || !data) {
    throw new Error('Employee schema not found')
  }

  const schemaFields: string[] = data.schema.fields.map((f: any) => f.key.toLowerCase().trim())

  if (excelHeaders.length < 2) {
    throw new Error('Excel must contain name and email columns')
  }

  if (excelHeaders[0] !== 'name') {
    throw new Error('First column must be "name"')
  }

  if (excelHeaders[1] !== 'email') {
    throw new Error('Second column must be "email"')
  }

  const excelCustomFields = excelHeaders.slice(2)

  const validCustomFields = excelCustomFields.length === schemaFields.length && schemaFields.every(field => excelCustomFields.includes(field))

  if (!validCustomFields) {
    throw new Error(
      `field mismatch. Expected: ${schemaFields.join(', ')}`
    )
  }

  const res = await fetch('http://localhost:8080/upload', {
    method: 'POST',
    headers: {
      'x-org-id': orgId,
      'x-employee-schema': JSON.stringify(schemaFields.map(k => ({ key: k }))),
    },
    body: formData,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }

  return { success: true }
}

