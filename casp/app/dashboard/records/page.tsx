import { RecordsTableClient } from "@/app/dashboard/records/components/records-table-client"
import getEmployeeSchema from "@/lib/database fetch/employee_schema"
import getOrganizationID from "@/lib/database fetch/organization_id"

type EmployeeField = {
  id: string
  key: string
  type: string
  label: string
  required: boolean
}

export default async function ShowAllRecords() {
  const { OrgId } = await getOrganizationID()

  const employeeFields = await getEmployeeSchema({ orgId: OrgId })

  const employeeSchema: EmployeeField[] = employeeFields.map((field) => ({
    ...field,
    label: field.label.toLowerCase(),
  }))

  return (
    <div className="w-full h-dvh pl-[20px] pr-[20px] pt-[15px]">
      <RecordsTableClient employeeSchema={employeeSchema} />
    </div>
  )
}
