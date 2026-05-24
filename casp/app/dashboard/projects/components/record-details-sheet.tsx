"use client"

import Image from "next/image"
import { flexRender } from "@tanstack/react-table"
import projectIcon from "@/public/assets/project.svg"
import userIcon from "@/public/assets/user icon.svg"
import mailIcon from "@/public/assets/mail grey.svg"
import calendarIcon from "@/public/assets/calendar.svg"
import pieIcon from "@/public/assets/piechart.svg"
import errorIcon from "@/public/assets/error icon.svg"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import type { Row } from "@tanstack/react-table"

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

type ProjectDetailsSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedRow: Row<Record<string, string>> | null
  isLoading: boolean
  isError?: boolean
  projectAssignments: ProjectAssignment[] | null
  projectAssignmentData: ProjectAssignment[] | null
  onRetry?: () => void
  isRetrying?: boolean
}

function formatLabel(label: string) {
  return label.replace(/_/g, " ").toUpperCase()
}

function formatDate(dateValue: string | null | undefined) {
  if (!dateValue) return "—"

  const parsedDate = new Date(dateValue)
  if (Number.isNaN(parsedDate.getTime())) return dateValue

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate)
}

function formatDateRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined
) {
  return `${formatDate(startDate)} - ${endDate ? formatDate(endDate) : "Present"}`
}

export function RecordDetailsSheet({
  open,
  onOpenChange,
  selectedRow,
  isLoading,
  isError = false,
  projectAssignments,
  projectAssignmentData,
  onRetry,
  isRetrying = false,
}: ProjectDetailsSheetProps) {
  const router = useRouter()
  const assignments = projectAssignments ?? []
  const teamAssignments = projectAssignmentData ?? []

  const editProjectRoute = () => {
    const id = selectedRow?.original?.id
    if (!id) return null
    return `/dashboard/projects/id?projectId=${id}`
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-[420px] flex-col p-[20px]">
        <div className="flex w-fit flex-row items-center justify-start rounded-[8px] border-[1.5px] border-dashed border-[#eaeaea] px-[8px] py-[2px] font-rethink text-[12px] font-medium text-black">
          <Image src={projectIcon} alt="project icon" className="mr-1 size-[15px]" />
          <span>
            {assignments.length} team member{assignments.length === 1 ? "" : "s"}
          </span>
        </div>

        <SheetHeader>
          <div className="mb-[5px] flex flex-row items-center justify-between">
            <SheetTitle className="hidden font-rethink">Project Details</SheetTitle>
            <SheetDescription className="hidden font-rethink" />
            <div className="flex flex-row items-center justify-center">
              <div className="mr-4 flex size-[50px] items-center justify-center rounded-[10px] bg-[#FAFAFA]">
                <Image src={projectIcon} alt="project icon" className="size-[26px]" />
              </div>
              <div className="flex flex-col items-start justify-center gap-1">
                <div className="mb-0 font-rethink text-[22px] font-semibold leading-none">
                  {selectedRow?.original?.name || ""}
                </div>
                <div className="flex flex-row items-center justify-center leading-none">
                  <Image src={mailIcon} alt="project meta icon" className="mr-2 size-[15px]" />
                  <span className="font-rethink text-[12px] font-medium leading-none text-[#909090]">
                    Project overview
                  </span>
                </div>
              </div>
            </div>
            <button
              onMouseEnter={() => {
                const href = editProjectRoute()
                if (!href) return
                router.prefetch(href)
              }}
              onFocus={() => {
                const href = editProjectRoute()
                if (!href) return
                router.prefetch(href)
              }}
              onClick={() => {
                const href = editProjectRoute()
                if (!href) return
                router.push(href)
              }}
              className="cursor-pointer items-center justify-center rounded-[8px] border-[1.5px] border-dashed border-[#eaeaea] bg-[#ffffff] px-[10px] transition-colors duration-200 hover:bg-[#f9f9f9]"
            >
              <span className="font-rethink text-[14px] font-medium text-black">edit</span>
            </button>
          </div>
        </SheetHeader>

        {isLoading ? (
          <div className="mt-4 flex flex-col gap-4">
            <Skeleton className="h-8 w-full rounded-[6px]" />
            <Skeleton className="h-32 w-full rounded-[6px]" />
            <Skeleton className="h-32 w-full rounded-[6px]" />
          </div>
        ) : assignments.length > 0 ? (
          <div className="mt-4 flex flex-1 flex-col gap-4 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
                {selectedRow &&
                selectedRow.getVisibleCells().map((cell) => {
                  const columnMeta = cell.column.columnDef.meta as
                    | { label?: string }
                    | undefined
                  const columnLabel = columnMeta?.label ?? cell.column.id

                  if (columnLabel !== "name" && cell.column.id !== "actions") {
                    return (
                      <div key={cell.id}>
                        <h3 className="font-rethink text-[11px] font-medium uppercase tracking-wider text-[#909090]">
                          {formatLabel(columnLabel)}
                        </h3>
                        <div className="font-rethink text-[14px] font-medium text-black">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </div>
                    )
                  }

                  return null
                })}
            </div>

            <div className="w-auto rounded-[10px] border-[1.5px] border-[#f2f2f2] bg-[#f9f9f9]">
              <div className="flex flex-row items-center justify-start rounded-t-[8px] px-[10px] py-[5px]">
                <Image src={projectIcon} alt="project icon" className="mr-2 inline-block size-[15px]" />
                <span className="font-rethink text-[12px] font-medium text-[#575757]">
                  TEAM MEMBERS
                </span>
              </div>
              <div className="rounded-b-[10px] bg-white">
                {teamAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="border-t-[1.5px] border-[#eaeaea] bg-white first:border-t-0"
                  >
                    <div className="px-[10px] py-[10px]">
                      <div className="flex flex-row items-center justify-start">
                        <Image src={userIcon} alt="user icon" className="mr-2 inline-block size-[12px]" />
                        <p className="font-rethink text-[14px] font-medium">
                          {assignment.employees?.system_profile?.name || "—"}
                        </p>
                      </div>
                      <div className="mt-[5px] flex flex-row items-center justify-between">
                        <div className="flex flex-row items-center justify-start">
                          <Image src={pieIcon} alt="allocation icon" className="mr-1 size-[14px]" />
                          <div>
                            <span className="font-bold">
                              {assignment.allocation_percentage}%
                            </span>{" "}
                            allocated
                          </div>
                        </div>
                        <div className="flex flex-row items-center justify-end">
                          <Image src={calendarIcon} alt="calendar icon" className="mr-1 size-[14px]" />
                          <span className="font-rethink text-[14px] font-semibold text-[#575757]">
                            {formatDateRange(assignment.start_date, assignment.end_date)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-row items-center justify-start">
                        <Image src={mailIcon} alt="mail icon" className="mr-1 size-[12px]" />
                        <span className="font-rethink text-[12px] text-[#909090]">
                          {assignment.employees?.system_profile?.email || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 overflow-y-auto">
            {selectedRow &&
              selectedRow.getVisibleCells().map((cell) => {
                const columnMeta = cell.column.columnDef.meta as
                  | { label?: string }
                  | undefined
                const columnLabel = columnMeta?.label ?? cell.column.id

                if (columnLabel !== "name" && cell.column.id !== "actions") {
                  return (
                    <div key={cell.id}>
                      <h3 className="font-rethink text-[11px] font-medium uppercase tracking-wider text-[#909090]">
                        {formatLabel(columnLabel)}
                      </h3>
                      <div className="mb-[20px] font-rethink text-[14px] font-medium text-black">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </div>
                  )
                }

                return null
              })}
            <div className="col-span-2 flex flex-row items-center justify-between rounded-[10px] border-[1.5px] border-dashed border-[#eaeaea] bg-[#fefefe] px-[10px] py-[10px]">
              <div className="flex flex-row items-center justify-center text-center">
                <Image src={errorIcon} alt="error icon" className="mr-2 size-[20px]" />
                <span className="font-rethink text-[14px] font-semibold leading-[15px] text-red-500">
                  Couldn&apos;t display team details
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-[10px] px-[20px] py-0 font-rethink text-[14px]"
                onClick={onRetry}
                disabled={!onRetry || isRetrying || !isError}
              >
                {isRetrying ? "Retrying..." : "Retry"}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
