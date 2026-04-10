import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Row = Record<string, string>

type EmployeeFields = {
  id: string
  key: string
  label: string
}

export function getColumns(employeeFields: EmployeeFields[]): ColumnDef<Row>[] {

  return [
    {
      id: 'actions',
      enableHiding: false,
      size: 25,
      minSize: 25,
      maxSize: 52,
      header: () => (
        <div className="w-6">
          <span className="sr-only">Actions</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="w-6 flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex size-4 p-0 text-muted-foreground data-[state=open]:bg-muted"
                size="icon"
                onClick={(event) => event.stopPropagation()}
              >
                <MoreVertical className="size-3.5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-28 p-1"
              onClick={(event) => event.stopPropagation()}
            >
              <DropdownMenuItem asChild className="text-sm py-1 px-1.5">
                <Link href={`/dashboard/employees/${row.original.id}`}>Edit</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs py-1 px-1.5" variant="destructive" onSelect={(event) => event.preventDefault()}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
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
    })),
  ]
}

