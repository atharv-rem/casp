"use client"
import usericon from "@/public/assets/user icon.svg"
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

type SchemaField = {
  id: string
  key: string
  type: string
  label: string
  required: boolean
}

type RecordDetails = {
  employee: any
  project: any
  employeeAssignments: any[]
  projectAssignments: any[]
  employeeSchema: { fields: SchemaField[] }
  projectSchema: { fields: SchemaField[] }
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({columns,data,}: DataTableProps<TData, TValue>) {
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
  const [recordDetails, setRecordDetails] = useState<RecordDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleRowClick = async (row: any) => {
    setSelectedRow(row)
    setIsSheetOpen(true)
    setIsLoading(true)
    setRecordDetails(null)

    const employeeId = row.original.employee_id
    const projectId = row.original.project_id

    try {
      const response = await fetch(`/api/record_details?employee_id=${employeeId}&project_id=${projectId}` )
      if (response.ok) {
        const data = await response.json()
        setRecordDetails(data)
        console.log("Fetched record details:", data)
      }
    } catch (error) {
      console.error("Failed to fetch record details:", error)
    } finally {
      setIsLoading(false)
    }
  }
  const formatLabel = (label: string) => {
    return label.replace(/_/g, " ").toUpperCase()
  }

  return (
    <>
    {/* table container */}
    <div className="w-full mt-[2px]">
      <div className="flex items-center justify-between pb-4 gap-4">
        <Input
          placeholder="Search all columns..."
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
          <TableHeader className="items-start justify-start">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-left">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
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
                  className="cursor-pointer hover:bg-muted"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="font-rethink text-left text-[14px]">
                      <div className="flex flex-row items-center">
                        <Image src={usericon} alt="user icon" className="size-[10px] mr-2" />
                        <span>{flexRender(cell.column.columnDef.cell, cell.getContext())}</span>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center font-rethink text-[12px]">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
    

    {/* sheet for record details */}
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetContent className="w-[400px] p-[20px] flex flex-col">
        <SheetHeader>
          <div className="flex flex-row items-start mb-[5px]">
            <SheetTitle className="font-rethink hidden">Record Details</SheetTitle>
            <SheetDescription className="hidden font-rethink"></SheetDescription>
            <div className="size-[45px] bg-[#FAFAFA] rounded-[10px] flex items-center justify-center mr-4">
              <Image src={usericon} alt="user icon" className="size-[25px]" />
            </div>
            <div className=" flex flex-col items-start justify-center gap-1">
              <span className="font-rethink text-[22px] font-semibold">{selectedRow?.original?.employee_name || ""}</span>
              <span className=" leading-0 font-rethink text-[12px] font-medium text-[#909090]">{selectedRow?.original?.employee_email || ""}</span>
            </div>
          </div>
        </SheetHeader>

        {isLoading ? (
          <div className="flex flex-col gap-4 mt-4">
            <Skeleton className="h-8 w-full rounded-[6px]" />
            <Skeleton className="h-32 w-full rounded-[6px]" />
            <Skeleton className="h-32 w-full rounded-[6px]" />
          </div>
        ) : recordDetails ? (
          <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-3 flex items-center justify-center py-[4px] px-[5px] shadow-xs h-[35px]">
              <TabsTrigger value="details" className="font-rethink font-bold text-[13px]">DETAILS</TabsTrigger>
              <TabsTrigger value="project" className="font-rethink font-bold text-[13px]">PROJECT DETAILS</TabsTrigger>
              <TabsTrigger value="assignments" className="font-rethink font-bold text-[13px]">ASSIGNMENTS</TabsTrigger>
            </TabsList>

            {/* Employee Details Tab */}
            <TabsContent value="details" className="flex-1 overflow-y-auto mt-[10px] ml-[5px]">
                {recordDetails.employee?.custom_profile && Object.keys(recordDetails.employee.custom_profile).length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(recordDetails.employee.custom_profile)
                        .map(([id, value]) => {
                          const field = recordDetails.employeeSchema?.fields?.find(f => f.id === id)
                          const label = field?.label || ''
                          return (
                            <div key={id}>
                              <p className="font-rethink text-[11px] font-medium text-[#909090] uppercase tracking-wider">
                                {formatLabel(label)}
                              </p>
                              <p className="font-rethink text-[14px] font-bold text-black">
                                {String(value) || "—"}
                              </p>
                            </div>
                          )
                        })}
                    </div>
                )}

                {recordDetails.employeeAssignments && recordDetails.employeeAssignments.length > 0 ? (
                    <>
                    <h3 className="font-rethink text-[11px] font-medium mt-4 text-[#909090]">ASSIGNED PROJECTS</h3>
                    <div className="space-y-2 mt-[5px] w-auto">
                      {recordDetails.employeeAssignments.map((assignment: any) => (
                        <div key={assignment.id} className="p-3 bg-[#fafafa] rounded-[8px]">
                          <p className="font-rethink text-[14px] font-bold">{assignment.projects?.name || "—"}</p>
                          <div className="flex gap-4 mt-1">
                            <span className="font-rethink text-[12px] text-[#686868]">
                              {assignment.allocation_percentage}% allocation      
                            </span>
                            <span className="font-rethink text-[12px] text-[#686868]">
                              {assignment.start_date} - {assignment.end_date || "Present"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    </>
                  ) : (
                    <p className="font-rethink text-[14px] text-[#686868]">No other project assignments</p>
                  )}
            </TabsContent>

            {/* Project Details Tab */}
            <TabsContent value="project" className="flex-1 overflow-y-auto mt-4">
              <div className="space-y-4">
                <div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="font-rethink text-[11px] font-medium text-[#909090] uppercase tracking-wider">NAME</p>
                      <p className="font-rethink text-[14px] font-medium text-black">{recordDetails.project?.name || "—"}</p>
                    </div>
                  </div>
                </div>

                {recordDetails.project?.meta && Object.keys(recordDetails.project.meta).length > 0 && (
                  <div>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(recordDetails.project.meta)
                        .filter(([id]) => {
                          // Only show fields that exist in the schema
                          const field = recordDetails.projectSchema?.fields?.find(f => f.id === id)
                          return field !== undefined
                        })
                        .map(([id, value]) => {
                          const field = recordDetails.projectSchema?.fields?.find(f => f.id === id)
                          const label = field?.label || ''
                          // Skip if value is an object (not a primitive)
                          if (typeof value === 'object' && value !== null) return null
                          return (
                            <div key={id}>
                              <p className="font-rethink text-[11px] font-medium text-[#909090] uppercase tracking-wider">
                                {formatLabel(label)}
                              </p>
                              <p className="font-rethink text-[14px] font-medium text-black">
                                {String(value) || "—"}
                              </p>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-rethink text-[11px] font-medium mt-4 text-[#909090]">TEAM MEMBERS</h3>
                  {recordDetails.projectAssignments && recordDetails.projectAssignments.length > 0 ? (
                    <div className="space-y-2 mt-[5px]">
                      {recordDetails.projectAssignments.map((assignment: any) => (
                        <div key={assignment.id} className="p-3 bg-[#fafafa] rounded-[8px]">
                          <p className="font-rethink text-[14px] font-medium">
                            {assignment.employees?.system_profile?.name || "—"}
                          </p>
                          <div className="flex gap-4 mt-1">
                            <span className="font-rethink text-[12px] text-[#686868]">
                              {assignment.allocation_percentage}% allocation
                            </span>
                            <span className="font-rethink text-[12px] text-[#686868]">
                              {assignment.start_date} - {assignment.end_date || "Present"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="font-rethink text-[14px] text-[#686868]">No team members assigned</p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Assignments Overview Tab */}
            <TabsContent value="assignments" className="flex-1 overflow-y-auto mt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-rethink text-[11px] font-medium mb-3 text-[#909090]">CURRENT ASSIGNMENT</h3>
                  <div className="p-3 bg-[#fafafa] rounded-[8px]">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-rethink text-[14px] font-medium">
                          {recordDetails.project?.name || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-2">
                      <span className="font-rethink text-[12px] text-[#686868]">
                        {selectedRow?.original?.allocation_percentage}% allocation
                      </span>
                      <span className="font-rethink text-[12px] text-[#686868]">
                        {selectedRow?.original?.start_date} - {selectedRow?.original?.end_date || "Present"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-rethink text-[11px] font-medium mb-3 text-[#909090]">
                    ALL ASSIGNMENTS FOR {recordDetails.employee?.system_profile?.name.toUpperCase() || "EMPLOYEE"}
                  </h3>
                  {recordDetails.employeeAssignments && recordDetails.employeeAssignments.length > 0 ? (
                    <div className="space-y-2">
                      {recordDetails.employeeAssignments.map((assignment: any) => (
                        <div 
                          key={assignment.id} 
                          className={`p-3 rounded-[8px] ${assignment.projects?.id === recordDetails.project?.id ? 'bg-[#fafafa]' : 'bg-[#fafafa]'}`}
                        >
                          <p className="font-rethink text-[14px] font-medium">{assignment.projects?.name || "—"}</p>
                          <div className="flex gap-4 mt-1">
                            <span className="font-rethink text-[12px] text-[#686868]">
                              {assignment.allocation_percentage}% allocation
                            </span>
                            <span className="font-rethink text-[12px] text-[#686868]">
                              {assignment.start_date} - {assignment.end_date || "Present"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="font-rethink text-[14px] text-[#686868]">No assignments found</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="grid grid-cols-2 overflow-y-auto mt-4">
            {selectedRow &&
              selectedRow.getVisibleCells().map((cell: any) => {
                const header = cell.column.columnDef.header;
                return (
                  <div key={cell.id} className="">
                    <h3 className="font-rethink text-[11px] font-medium text-[#909090] uppercase tracking-wider">
                      {typeof header === "string" ? header : cell.column.id.replace(/_/g, " ")}
                    </h3>
                    <div className="font-rethink text-[14px] font-medium text-black mb-[20px]">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  </div>
                );
            })}
          </div>
        )}
      </SheetContent>
    </Sheet>
    </>
  )
}