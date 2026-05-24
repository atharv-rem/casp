import getOrganizationID from "@/lib/database fetch/organization_id"
import getProjectSchema from "@/lib/database fetch/project_schema"
import ProjectDetail from "./components/project-detail"

type ProjectField = {
  id: string
  key: string
  type: string
  label: string
  required: boolean
}

type PageProps = {
  searchParams: Promise<{ projectId?: string }>
}

export default async function ProjectDetailPage({ searchParams }: PageProps) {
  const { projectId } = await searchParams
  const { OrgId } = await getOrganizationID()
  const projectSchema = await getProjectSchema({ orgId: OrgId })

  return (
    <ProjectDetail
      projectId={projectId ?? ""}
      projectSchema={projectSchema as ProjectField[]}
    />
  )
}
