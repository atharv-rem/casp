"use client"
import { useQuery,useQueries } from "@tanstack/react-query"


import usericon from "@/public/assets/user icon.svg"
import emailicon from "@/public/assets/mail black.svg"
import Image from "next/image"
import { useState } from "react"
import {
  ColumnDef,
  flexRender,
  ColumnFiltersState,
  getFilteredRowModel,
  getCoreRowModel,
  SortingState,
  getSortedRowModel,
  VisibilityState,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Settings2 } from "lucide-react"
import { RecordDetailsSheet} from "./record-details-sheet"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  employeeSchema: EmployeeFields[]
}

type EmployeeFields = {
  id: string
  key: string
  type: string
  label: string
  required: boolean
}

export function DataTable<TData, TValue>({columns,data, employeeSchema}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [globalFilter, setGlobalFilter] = useState("")

    const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  })

  const [selectedRow, setSelectedRow] = useState<any>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [EmployeeId, setEmployeeId] = useState<string | null>(null)

  const {data: employeeAssignments, isLoading,} = useQuery({
    queryKey: ["recordDetails", EmployeeId],
    queryFn: async () => {
      if (!EmployeeId) return null

      const response = await fetch(
        `/api/database/getEmployeeAssignedToProjects?employeeId=${EmployeeId}`
      )

      if (!response.ok) {
        throw new Error("Failed to fetch record details")
      }
      return response.json()
    },
    enabled: !!EmployeeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })

  const projectIds: string[] = (employeeAssignments ?? []).map(
    (assignedProjects: { projects: { id: string } }) => assignedProjects.projects.id
  )

  const projectAssignment = useQueries({
    queries: projectIds.map((projectId) => ({
      queryKey: ["project", projectId],
      queryFn: async () => {
        const response = await fetch(
          `/api/database/getProjectsAssignedToEmployees?projectId=${projectId}`
        )

        if (!response.ok) {
          throw new Error("Failed to fetch project")
        }

        return response.json()
      },
      staleTime: 5 * 60 * 1000,
    })),
  })

  const projectAssignmentData = projectAssignment.flatMap((query) =>
    Array.isArray(query.data) ? query.data : []
  )

  const handleRowClick = (row: any) => {
    const employeeId = row.original.employee_id ?? row.original.id
    setSelectedRow(row)
    setIsSheetOpen(true)
    setEmployeeId(employeeId)

  }

  return (
    <>
    {/* table container */}
    <div className="w-full mt-[2px]">
      <div className="flex items-center justify-between pb-4 gap-4">
        <Input
          placeholder="Search for an employee..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className=" h-[30px] max-w-sm rounded-[10px] font-rethink text-[12px]"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-[30px] ml-auto rounded-[10px] font-rethink text-[12px]">
              <Settings2 className="mr-2 h-[15px] w-[15px]" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize font-rethink text-[14px]"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id.replace(/_/g, " ")}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-hidden">
        <Table className="">
          {/*render table header, we loop through the header groups and render each header, we use flexRender to render the header based on whether it's a string or a React component, we also check if the header is a placeholder, if it is we don't render anything*/}
          <TableHeader className="items-start justify-start">
            {table.getHeaderGroups().map((headerGroup) => (//tanstack wraps header in a group so we map over that
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {//we loop through each header and render it, flexRender is a tanstack function that takes care of rendering the header based on whether it's a string or a React component
                  return (
                    <TableHead key={header.id} className="text-left">
                      {header.isPlaceholder ? null :flexRender(header.column.columnDef.header,header.getContext())}{/*this is where the header is rendered*/}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          {/*render table body, we check if there are rows to display, if not we show a message, otherwise we render the rows, we also add an onClick handler to each row to open the details sheet when clicked*/}
          <TableBody>
            {table.getRowModel().rows?.length ? (//if there are rows to display we map over them and render them, otherwise we show a message saying no results found
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => handleRowClick(row)}
                  className="cursor-pointer hover:bg-muted"
                >
                  {row.getVisibleCells().map((cell) => (//It returns only the cells for columns that are currently visible. If a column is hidden via your “Columns” dropdown:It disappears here automatically.
                    <TableCell key={cell.id} className="font-rethink text-left text-[14px]">{/*we render the cell value using flexRender, we also check if the cell is in the employee_name column, if it is we add a user icon next to it*/}
                      <div className="flex flex-row items-center">
                        {cell.column.id === "employee_name" && (
                          <Image src={usericon} alt="user icon" className="size-[10px] mr-2" />
                        )}

                        {cell.column.id === "employee_email" && (
                          <Image src={emailicon} alt="email icon" className="size-[15px] mr-2" />
                        )}
                        <span>{flexRender(cell.column.columnDef.cell, cell.getContext())}</span>{/*this is where the cell value is rendered, flexRender is a tanstack function that takes care of rendering the cell based on whether it's a string or a React component*/}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) 
            : 
            (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center font-rethink text-[12px]">
                  No results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* pagination */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground font-rethink">
          <span>
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} results
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-rethink text-muted-foreground">Rows per page</span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger size="xs" className=" w-[70px] rounded-[6px] text-[12px] font-rethink px-2 py-0">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`} className="text-[12px] font-rethink">
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-[6px]"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-[6px]"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[12px] font-rethink px-2">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-[6px]"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-[6px]"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
    

    <RecordDetailsSheet
      open={isSheetOpen}
      onOpenChange={setIsSheetOpen}
      selectedRow={selectedRow}
      isLoading={isLoading}
      employeeAssignment={employeeAssignments}
      projectAssignment={projectAssignmentData}
      employeeSchema={employeeSchema}
    />
    </>
  )
}