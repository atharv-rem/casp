"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import add_project from "@/lib/database add/addProject";
import add_employee from "@/lib/database add/addEmployee";
import add_assignment from "@/lib/database add/addAssignment";

type custom_project_fields = {
  id: string;
  label: string;
  value: any;
}[];

type custom_employee_fields = {
  id: string;
  label: string;
  value: any;
}[];

type default_employee_fields = {
  name: string;
  email: string;
}

type assignment_fields = {
  organization_id: string;
  employee_id: string;
  project_id: string;
  allocation_percentage: number;
  start_date: string;
  end_date?: string | null;
}

type assignment_form_fields = Partial<Pick<assignment_fields, "project_id" | "allocation_percentage" | "start_date" | "end_date">>;

type complete_assignment_form_fields = {
  project_id: string;
  allocation_percentage: number;
  start_date: string;
  end_date?: string | null;
};

export async function add_single_employee_record(prevState: any,formData: FormData) {
  const organization_id = formData.get("organization_id") as string;
  const systemName = formData.get("system_name")?.toString().trim() ?? "";
  const systemEmail = formData.get("system_email")?.toString().trim() ?? "";
  const default_employee_fields: default_employee_fields = {
    "name": systemName,
    "email": systemEmail,
  };
  const custom_employee_fields: custom_employee_fields = [];
  const assignments: assignment_form_fields[] = [];

  for (const [key, value] of formData.entries()) {
    if (key === "organization_id" || key === "system_name" || key === "system_email" || key.startsWith("$ACTION_ID_")    ) {
      continue;
    }

    if (key.startsWith("assignments[")) {
      const match = key.match(/assignments\[(\d+)\]\[(.+)\]/);
      if (!match) continue;

      const index = Number(match[1]);
      const field = match[2];

      const currentAssignment = assignments[index] || {};

      if (field === "project_id") {
        currentAssignment.project_id = String(value);
      } else if (field === "start_date") {
        currentAssignment.start_date = String(value);
      } else if (field === "end_date") {
        currentAssignment.end_date = String(value);
      } else if (field === "allocation_percentage") {
        currentAssignment.allocation_percentage = Number(value);
      }

      assignments[index] = currentAssignment;
      continue;
    }

    else if (key.includes("||")) {
      const [id, label] = key.split("||");
      custom_employee_fields.push({
        id: id.trim(),
        label: label.trim(),
        value: value,
      });
    }
  }
  
  const EmployeeResult = await add_employee(organization_id, default_employee_fields, custom_employee_fields); 

  if (EmployeeResult.error) {
    return { success: false, error: "Failed to create employee" };
  }

  const validAssignments = assignments.filter(
    (a): a is complete_assignment_form_fields =>
      typeof a?.project_id === "string" &&
      a.project_id.length > 0 &&
      typeof a?.allocation_percentage === "number" &&
      !Number.isNaN(a.allocation_percentage) &&
      typeof a?.start_date === "string" &&
      a.start_date.length > 0
  );

  if (validAssignments.length > 0) {
    const rows = validAssignments.map((a) => ({
      organization_id,
      employee_id: EmployeeResult.employeeID,
      project_id: a.project_id,
      allocation_percentage: Number(a.allocation_percentage),
      start_date: a.start_date,
      end_date: a.end_date || null,
    }));

    const assignmentResults = await add_assignment(organization_id, rows);

    if (assignmentResults.error) {
      return {success: false, error: "Employee created but project assignment failed"};
    }
  }
  
  return { success: true };
}


export async function add_single_project_record(prevState: any, formData: FormData) {
  try {
    const organization_id = formData.get("organization_id") as string;
    const custom_project_fields: custom_project_fields = [];
    const project_name = formData.get("project_name") as string;
    for (const [key, value] of formData.entries()) {
      if (key === "organization_id" || key === "project_name" || key.startsWith("$ACTION_ID_")) {
        continue; // Skip these fields as they have already been mapped
      }
      if (key.includes("||")) {
        const [id, label] = key.split("||");
        custom_project_fields.push({
          id: id,
          label: label,
          value: value
        });
      }
    }
    const result = await add_project(organization_id, custom_project_fields, project_name);
    if (!result.success) {
      return { success: false, error: result.error };
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



