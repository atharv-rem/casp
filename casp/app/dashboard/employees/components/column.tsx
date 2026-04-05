import { ColumnDef } from '@tanstack/react-table'

type Row = Record<string, string>

type EmployeeFields = {
  id: string
  key: string
  label: string
}

export function getColumns(employeeFields: EmployeeFields[]): ColumnDef<Row>[] {

  return [
    {
      accessorKey: 'employee_name',
      header: () => <span className="font-rethink font-bold text-[14px]">Employee Name</span>,
    },
    {
      accessorKey: 'employee_email',
      header: () => <span className="font-rethink font-bold text-[14px]">Employee Email</span>,
    },
    ...employeeFields.map(field => ({
      accessorKey: field.id,
      meta:{ label: field.label },
      header: () => <span className="font-rethink font-bold text-[14px]">{field.label.slice(0, 1).toUpperCase() + field.label.toLowerCase().slice(1)}</span>
    })) 
  ]
}

