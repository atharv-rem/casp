"use client"
import { DataTable } from "./data-table"
import { getColumns } from "./column"
import { useEmployeeSync } from "./sync-provider"
import type { Employee } from "@/lib/sync/collection"

type EmployeeFields = {
  id: string
  key: string
  type: string
  label: string
  required: boolean
}

type Row = {
  id: string
  employee_name: string
  employee_email: string
  [key: string]: string
}

type RecordsTableProps = {
  employeeSchema: EmployeeFields[]
}

type CustomProfileItem = {
  id: string
  value: string | null
  label?: string
}

function normalizeCustomProfile(value: unknown): CustomProfileItem[] {
  if (Array.isArray(value)) {
    return value as CustomProfileItem[]
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? (parsed as CustomProfileItem[]) : []
    } catch {
      return []
    }
  }

  return []
}

function normalizeSystemProfile(value: unknown): { name?: string; email?: string } | null {
  if (!value) return null

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return parsed && typeof parsed === "object" ? parsed : null
    } catch {
      return null
    }
  }

  if (typeof value === "object") {
    return value as { name?: string; email?: string }
  }

  return null
}

export function RecordsTable({ employeeSchema }: RecordsTableProps) {
  const columns = getColumns(employeeSchema)
  const { employees, isLoading, isError } = useEmployeeSync()
  const rows: Row[] = employees.map((employee: Employee) => {
    const customProfile = normalizeCustomProfile(employee.custom_profile)
    const systemProfile = normalizeSystemProfile(employee.system_profile)

    const customFields = Object.fromEntries(
      employeeSchema.map((field) => {
        const match = customProfile.find((item) => item.id === field.id)
        return [field.id, match?.value ?? "—"]
      })
    )

    return {
      id: employee.id,
      employee_name: systemProfile?.name ?? "—",
      employee_email: systemProfile?.email ?? "—",
      ...customFields,
    }
  })

  if (isLoading) {
    return (
      <div className="flex w-full h-full text-sm text-gray-600 font-rethink font-regular">
        Syncing employee records...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex w-full h-full text-sm text-red-600 font-rethink font-regular">
        Failed to load live employee records.
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={rows}
      employeeSchema={employeeSchema}
    />
  )
}
