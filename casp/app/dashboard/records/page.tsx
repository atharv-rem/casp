import { RecordsTable } from "@/app/dashboard/records/components/records-table"
import  getEmployeeSchema from "@/lib/database fetch/employee_schema"
import getProjectSchema from "@/lib/database fetch/project_schema"
import getOrganizationID from "@/lib/database fetch/organization_id"
import getEmployeeById from "@/lib/database fetch/employee"

type EmployeeField = {
  id: string
  key: string
  type: string
  label: string
  required: boolean
}

export default async function ShowAllRecords() {
  const {OrgId} = await getOrganizationID()
  const [employees, employeeFields, projectFields] = await Promise.all([
    getEmployeeById({ orgId: OrgId }),
    getEmployeeSchema({ orgId: OrgId }),
    getProjectSchema({ orgId: OrgId }),
  ])

  const employeeSchema: EmployeeField[] = employeeFields.map((field) => ({
    ...field,
    label: field.label.toLowerCase(),
  }))
  const projectSchema = projectFields.map(f => ({ key: f.id, label: f.label.toLowerCase() }))

  const fieldMap = Object.fromEntries(employeeFields.map(f => [f.id, f.label.toLowerCase()]))

  const rows = employees?.map(row => {
    const mappedCustomFields = Object.fromEntries(
      Object.entries(row.custom_profile ?? {})
        .map(([id, value]) => {const key = fieldMap[id]
          if (!key) return null
          return [key, value ?? '-']
        })
        .filter(Boolean) as [string, unknown][]
    )

    return {
      id: row.id,
      employee_name: row.system_profile?.name ?? '—',
      employee_email: row.system_profile?.email ?? '—',
      ...mappedCustomFields,
    }
  }
) ?? []

  return (
    <div className="w-full h-dvh pl-[20px] pr-[30px] pt-[15px]">
      <RecordsTable
        employeeSchema={employeeSchema}
        rows={rows}
      />
    </div>
  )
}
