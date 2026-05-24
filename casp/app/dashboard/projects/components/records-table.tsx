"use client"

import UnicodeSpinner from "@/app/global components/unicode_spinner"
import { TextShimmer } from "@/components/ui/shimmer"
import { DataTable } from "./data-table"
import { getColumns } from "./column"
import { useProjectSync } from "./sync-provider"
import type { Project } from "@/lib/sync/collection"

type ProjectFields = {
  id: string
  key: string
  type: string
  label: string
  required: boolean
}

type Row = {
  id: string
  name: string
  [key: string]: string
}

type RecordsTableProps = {
  projectSchema: ProjectFields[]
}

type CustomProjectItem = {
  id: string
  value: string | null
  label?: string
}

function normalizeProjectMeta(value: unknown): CustomProjectItem[] {
  if (Array.isArray(value)) {
    return value as CustomProjectItem[]
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? (parsed as CustomProjectItem[]) : []
    } catch {
      return []
    }
  }

  return []
}

export function RecordsTable({ projectSchema }: RecordsTableProps) {
  const columns = getColumns(projectSchema)
  const { projects, isLoading, isError } = useProjectSync()

  const rows: Row[] = projects.map((project: Project) => {
    const customMeta = normalizeProjectMeta(project.meta)

    const customFields = Object.fromEntries(
      projectSchema.map((field) => {
        const match = customMeta.find((item) => item.id === field.id)
        return [field.id, match?.value ?? "—"]
      })
    )

    return {
      id: project.id,
      name: project.name ?? "—",
      ...customFields,
    }
  })

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex items-center gap-2">
          <UnicodeSpinner
            name="orbit"
            className="font-mono text-[16px] leading-none text-black"
          />
          <TextShimmer
            className="font-rethink text-md font-regular"
            colors={["transparent", "rgb(0, 0, 0)", "transparent"]}
          >
            Syncing project records...
          </TextShimmer>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center font-rethink text-md font-regular text-red-600">
        Failed to load live project records.
      </div>
    )
  }

  return <DataTable columns={columns} data={rows} />
}
