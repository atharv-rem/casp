import EmployeeDetail from "./components/employee-detail"
import getEmployeeSchema from "@/lib/database fetch/employee_schema"
import getOrganizationID from "@/lib/database fetch/organization_id"

type EmployeeField = {
  id: string
  key: string
  type: string
  label: string
  required: boolean
}

type PageProps = {
  params: Promise<{ id: string }>
}
export default async function EmployeeDetailPage({ params }: PageProps) {
  const { id } = await params
  const { OrgId } = await getOrganizationID()
  const employeeSchema = await getEmployeeSchema({ orgId: OrgId })

  return <EmployeeDetail id={id} employeeSchema={employeeSchema as EmployeeField[]} />
}
