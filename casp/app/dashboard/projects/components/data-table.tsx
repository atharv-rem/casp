"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import projectIcon from "@/public/assets/project.svg"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
  type Row,
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
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Settings2,
} from "lucide-react"
import { RecordDetailsSheet } from "./record-details-sheet"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

type ProjectAssignment = {
  id: string
  start_date: string
  end_date: string | null
  allocation_percentage: number
  employees: {
    system_profile: {
      name?: string
      email?: string
    } | null
  } | null
  projects: {
    id: string
    name: string
  } | null
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [selectedRow, setSelectedRow] = useState<Row<any> | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [projectId, setProjectId] = useState<string | null>(null)
  const queryClient = useQueryClient()

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

  const {
    data: projectAssignments,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery<ProjectAssignment[] | null>({
    queryKey: ["projectDetails", projectId],
    queryFn: async () => {
      if (!projectId) return null

      const response = await fetch(
        `/api/database_fetch/getProjectsAssignedToEmployees?projectId=${projectId}`
      )

      if (!response.ok) {
        throw new Error("Failed to fetch project details")
      }

      return response.json()
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })

  const projectAssignmentData = projectAssignments ?? []

  const prefetchProjectDetails = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ["projectDetails", id],
      queryFn: async () => {
        const response = await fetch(
          `/api/database_fetch/getProjectsAssignedToEmployees?projectId=${id}`
        )

        if (!response.ok) {
          throw new Error("Failed to fetch project details")
        }

        return response.json()
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    })
  }

  const handleRowClick = (row: Row<any>) => {
    const id = row.original.id
    setSelectedRow(row)
    setIsSheetOpen(true)
    setProjectId(id)
  }

  const handleRowHover = (row: Row<any>) => {
    const id = row.original.id
    if (!id) return
    prefetchProjectDetails(id)
  }

  return (
    <>
      <div className="w-full mt-[2px]">
        <div className="flex items-center justify-between gap-4 pb-4">
          <Input
            placeholder="Search for a project..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="h-[30px] max-w-sm rounded-[10px] font-rethink text-[12px]"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="ml-auto h-[30px] rounded-[10px] font-rethink text-[12px]"
              >
                <Settings2 className="mr-2 h-[15px] w-[15px]" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize font-rethink text-[14px]"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id.replace(/_/g, " ")}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="overflow-hidden">
          <Table>
            <TableHeader className="items-start justify-start">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={`text-left ${header.column.id === "name" ? "sticky left-0 z-30 bg-background" : ""}`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => handleRowClick(row)}
                    onMouseEnter={() => handleRowHover(row)}
                    className="group cursor-pointer hover:bg-muted"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={`font-rethink text-left text-[14px] ${cell.column.id === "name" ? "sticky left-0 z-20 bg-background group-hover:bg-muted" : ""}`}
                      >
                        <div className="flex flex-row items-center">
                          {cell.column.id === "name" && (
                            <Image
                              src={projectIcon}
                              alt="project icon"
                              className="mr-2 size-[14px]"
                            />
                          )}
                          <span>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </span>
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center font-rethink text-[12px]"
                  >
                    <Link
                      href="/dashboard/add_records"
                      className="rounded-md border-1 border-gray-300 px-[10px] py-1 hover:bg-gray-100"
                    >
                      add project
                    </Link>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2 text-[12px] font-rethink text-muted-foreground">
            <span>
              Showing{" "}
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}{" "}
              to{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{" "}
              of {table.getFilteredRowModel().rows.length} results
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-rethink text-muted-foreground">
                Rows per page
              </span>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="xs" className="w-[70px] rounded-[6px] px-2 py-0 text-[12px] font-rethink">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem
                      key={pageSize}
                      value={`${pageSize}`}
                      className="text-[12px] font-rethink"
                    >
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
              <span className="px-2 text-[12px] font-rethink">
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
        isError={isError}
        projectAssignments={projectAssignments ?? null}
        projectAssignmentData={projectAssignmentData}
        onRetry={() => {
          void refetch()
        }}
        isRetrying={isFetching && !isLoading}
      />
    </>
  )
}
