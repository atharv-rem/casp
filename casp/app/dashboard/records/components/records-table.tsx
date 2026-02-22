"use client"

import { DataTable } from "./data-table"
import { getColumns} from "./column"

type EmployeeFields = {
  id: string
  key: string
  type: string
  label: string
  required: boolean
}

type Row = {
  "id":string,
  "employee_name": string,
  "employee_email": string,
  [key: string]: string

}

type RecordsTableProps = {
  employeeSchema: EmployeeFields[]
  rows: Row[]
}  

export function RecordsTable({ employeeSchema, rows }: RecordsTableProps) {
  const columns = getColumns(employeeSchema)
  return <DataTable columns={columns} data={rows} employeeSchema={employeeSchema} />
}
