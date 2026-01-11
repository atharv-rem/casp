import { ColumnDef } from '@tanstack/react-table'

export type AssignmentRow = {
  id: string
  employee_name: string
  employee_email: string
  project_name: string
  start_date: string
  end_date?: string
  allocation_percentage?: number
  [key: string]: any
}

export type DynamicField = {
  key: string
  label: string
}

export function getColumns(
  employeeFields: DynamicField[],
  projectFields: DynamicField[]
): ColumnDef<AssignmentRow>[] {

  return [
    {
      accessorKey: 'employee_name',
      header: () => <span className="font-rethink font-bold text-[14px]">EMPLOYEE NAME</span>,
    },
    {
      accessorKey: 'employee_email',
      header: () => <span className="font-rethink font-bold text-[14px]">EMPLOYEE EMAIL</span>,
    },
    ...employeeFields.map(field => ({
      accessorKey: `emp_${field.key}`,
      header: () => <span className="font-rethink font-bold text-[14px]">{field.label.toUpperCase()}</span>,
      cell: ({ row }) => row.getValue(`emp_${field.key}`) ?? '—',
    })) as ColumnDef<AssignmentRow>[],
    {
      accessorKey: 'project_name',
      header: () => <span className="font-rethink font-bold text-[14px]">PROJECT NAME</span>,
    },
    ...projectFields.map(field => ({
      accessorKey: `proj_${field.key}`,
      header: () => <span className="font-rethink font-bold text-[14px]">{field.label.toUpperCase()}</span>,
      cell: ({ row }) => row.getValue(`proj_${field.key}`) ?? '—',
    })) as ColumnDef<AssignmentRow>[],
    {
      accessorKey: 'start_date',
      header: () => <span className="font-rethink font-bold text-[14px]">START DATE</span>,
    },
    {
      accessorKey: 'end_date',
      header: () => <span className="font-rethink font-bold text-[14px]">END DATE</span>,
    },
    {
      accessorKey: 'allocation_percentage',
      header: () => <span className="font-rethink font-bold text-[14px]">ALLOCATION %</span>,
      cell: ({ row }) => {
        const value = row.getValue('allocation_percentage')
        return value ? `${value}%` : '—'
      },
    },
  ]
}

