import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Row = Record<string, string>

type ProjectFields = {
  id: string
  key: string
  label: string
}

export function getColumns(projectFields: ProjectFields[]): ColumnDef<Row>[] {
  return [
    {
      id: "actions",
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
        <div className="flex w-6 items-center justify-center">
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
              <DropdownMenuItem asChild className="px-1.5 py-1 text-sm">
                <Link href={`/dashboard/projects/id?projectId=${row.original.id}`}>Edit</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="px-1.5 py-1 text-xs"
                variant="destructive"
                onSelect={(event) => event.preventDefault()}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: () => (
        <span className="font-rethink text-[14px] font-bold">Project Name</span>
      ),
    },
    ...projectFields.map((field) => ({
      accessorKey: field.id,
      meta: { label: field.label },
      header: () => (
        <span className="font-rethink text-[14px] font-bold">
          {field.label.slice(0, 1).toUpperCase() + field.label.toLowerCase().slice(1)}
        </span>
      ),
    })),
  ]
}
