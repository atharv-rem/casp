import { RecordsTable } from "@/app/dashboard/projects/components/records-table"
import getProjectSchema from "@/lib/database fetch/project_schema"
import getOrganizationID from "@/lib/database fetch/organization_id"

type ProjectField = {
  id: string
  key: string
  type: string
  label: string
  required: boolean
}

export default async function ProjectsPage() {
  const { OrgId } = await getOrganizationID()

  const projectFields = await getProjectSchema({ orgId: OrgId })

  const projectSchema: ProjectField[] = projectFields.map((field) => ({
    ...field,
    label: field.label.toLowerCase(),
  }))

  return (
    <div className="w-full h-dvh pl-[20px] pr-[20px] pt-[15px]">
      <RecordsTable projectSchema={projectSchema} />
    </div>
  )
}
