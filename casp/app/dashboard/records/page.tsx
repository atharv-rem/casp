import { RecordsTable } from "@/app/dashboard/records/components/records-table"
import { supabaseAdmin } from "@/lib/supabase/admin"

type SchemaField = {
  id: string
  key: string
  type: string
  label: string
  required: boolean
}

export default async function ShowAllRecords() {
  const supabase = supabaseAdmin

  const { data: employeeSchemaData } = await supabase
    .from("employee_schemas")
    .select("schema")
    .single()

  const { data: projectSchemaData } = await supabase
    .from("project_schemas")
    .select("schema")
    .single()

  // Extract fields from schema JSONB - use 'id' as key since custom_profile uses UUIDs
  const employeeFields: SchemaField[] = employeeSchemaData?.schema?.fields ?? []
  const projectFields: SchemaField[] = projectSchemaData?.schema?.fields ?? []

  // Convert to format expected by columns (using id as key since that's what custom_profile uses)
  const employeeSchema = employeeFields.map(f => ({ key: f.id, label: f.label.toLowerCase() }))
  const projectSchema = projectFields.map(f => ({ key: f.id, label: f.label.toLowerCase() }))

  const { data: assignments } = await supabase
    .from("employee_project_assignments")
    .select(`
      id,
      start_date,
      end_date,
      allocation_percentage,
      employees!employee_id (
        role,
        status,
        system_profile,
        custom_profile
      ),
      projects!project_id (
        name,
        meta
      )
    `)

  const rows =
    assignments?.map(row => {
      const systemProfile = row.employees?.system_profile ?? {}
      const customProfile = row.employees?.custom_profile ?? {}
      const projectMeta = row.projects?.meta ?? {}

      return {
        id: row.id,
        employee_name: systemProfile.name ?? '—',
        employee_email: systemProfile.email ?? '—',
        ...Object.fromEntries(
          Object.entries(customProfile).map(([key, value]) => [
            `emp_${key}`,
            value,
          ])
        ),
        project_name: row.projects?.name ?? '—',
        ...Object.fromEntries(
          Object.entries(projectMeta).map(([key, value]) => [
            `proj_${key}`,
            value,
          ])
        ),
        start_date: row.start_date,
        end_date: row.end_date,
        allocation_percentage: row.allocation_percentage,
      }
    }) ?? []

  return (
    <div className="w-full h-dvh pl-[30px] pr-[30px] pt-[20px]">
      <RecordsTable
        employeeSchema={employeeSchema}
        projectSchema={projectSchema}
        rows={rows}
      />
    </div>
  )
}
