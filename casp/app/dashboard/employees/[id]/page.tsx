import { readFileSync } from "node:fs"
import { join } from "node:path"
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
  const logoSvg = readFileSync(join(process.cwd(), "public", "assets", "casp logo.svg"), "utf8")
  const logoDataUri = `data:image/svg+xml;base64,${Buffer.from(logoSvg, "utf8").toString("base64")}`

  return <EmployeeDetail id={id} employeeSchema={employeeSchema as EmployeeField[]} logoDataUri={logoDataUri} />
}
