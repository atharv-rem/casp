"use client"

import { DataTable } from "./data-table"
import { getColumns, DynamicField, AssignmentRow } from "./column"

interface RecordsTableProps {
  employeeSchema: DynamicField[]
  projectSchema: DynamicField[]
  rows: AssignmentRow[]
}

export function RecordsTable({ employeeSchema, projectSchema, rows }: RecordsTableProps) {
  const columns = getColumns(employeeSchema, projectSchema)
  
  return <DataTable columns={columns} data={rows} />
}
