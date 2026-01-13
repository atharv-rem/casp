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
  SheetTrigger,
} from "@/components/ui/sheet"

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

  const handleRowClick = (row: any) => {
    setSelectedRow(row)
    setIsSheetOpen(true)
  }

  return (
    <>
    <div className="w-full">
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

      <div className="overflow-hidden rounded-md border">
        <Table>
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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

    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetContent className="w-[400px] p-[20px] flex flex-col">
        <SheetHeader>
          <div className="flex flex-row items-center justify-start gap-2">
            <SheetTitle className="font-rethink text-[18px] hidden">Record Details</SheetTitle>
            <SheetDescription className=" hidden font-rethink text-[14px]"></SheetDescription>
            <Image src={usericon} alt="User Icon" className="size-[20px] opacity-[50%]" />
            <div className="font-rethink text-[14px] font-medium px-[10px] rounded-[8px] bg-[#E3F5F5]">Employee</div>
          </div>
        </SheetHeader>
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
        </SheetContent>
    </Sheet>
    </>
  )
}