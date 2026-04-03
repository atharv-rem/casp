import { RecordsTable } from "@/app/dashboard/records/components/records-table"
import  getEmployeeSchema from "@/lib/database fetch/employee_schema"
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
  const [employees, employeeFields] = await Promise.all([
    getEmployeeById({ orgId: OrgId }),
    getEmployeeSchema({ orgId: OrgId }),
  ])

  // Normalize schema: Ensure the label is lowercase if your Table component expects it
  const employeeSchema: EmployeeField[] = employeeFields.map((field) => ({
    ...field,
    label: field.label.toLowerCase(),
  }))

  // Transform employee data to match the expected format for the RecordsTable component
  const rows = employees?.map(employee => {
    // We iterate over the SCHEMA fields to ensure the table structure is maintained
    const customFields = Object.fromEntries(
      employeeFields.map((field) => {
        // Look for the specific field ID in this employee's custom_profile array
        const match = employee.custom_profile?.find((item: { id: string; value: string | null }) => item.id === field.id)
        // If found, use the value; if not (new column), return a placeholder
        return [field.id, match?.value ?? '—']
      })
    )


    return {
      id: employee.id,
      employee_name: employee.system_profile?.name ?? '—',
      employee_email: employee.system_profile?.email ?? '—',
      ...customFields, 
    }
  }) ?? []

  return (
    <div className="w-full h-dvh pl-[20px] pr-[20px] pt-[15px]">
      <RecordsTable
        employeeSchema={employeeSchema}
        rows={rows}
      />
    </div>
  )
}