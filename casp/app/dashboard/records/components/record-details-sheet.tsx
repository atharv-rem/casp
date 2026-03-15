"use client"

import usericon from "@/public/assets/user icon.svg"
import mail from "@/public/assets/mail grey.svg"
import cube from "@/public/assets/cube.svg"
import calendar from "@/public/assets/calendar.svg"
import Image from "next/image"
import { motion } from "motion/react"
import { flexRender } from "@tanstack/react-table"
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
import erroricon from "@/public/assets/error icon.svg"


type systemProfile = {
  "name": string 
  "email": string
}

type customcolumns = {
  id: string
  label: string
  value: string | number | null
}

type Employee = {
  custom_profile: customcolumns[]
  system_profile: systemProfile
}

type Project = {
  id: string
  meta: customcolumns[]
  name: string
}

type Assignment = {
  "id": string,
  "start_date": string,
  "end_date": string | null,
  "allocation_percentage": number,
  "employees": Employee,
  "projects": Project,
}


interface RecordDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedRow: any
  isLoading: boolean
  employeeAssignment: Assignment[] | null
  projectAssignment: Assignment[] | null
}

function AllocationProgressBar({ percentage }: { percentage: number }) {
  const safePercentage = Number.isFinite(percentage)
    ? Math.max(0, Math.min(100, percentage))
    : 0
  const isFullyAllocated = safePercentage >= 100

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="font-rethink font-semibold text-[12px] text-[#575757]">Allocated</span>
        <span className="font-rethink font-semibold text-[12px] text-black">{safePercentage}%</span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${safePercentage}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full w-0 rounded-full transition-colors duration-300 ${isFullyAllocated ? "bg-emerald-400" : "bg-[#575757]"}`}
        />
      </div>
    </div>
  )
}

export function RecordDetailsSheet({
  open,
  onOpenChange,
  selectedRow,
  isLoading,
  employeeAssignment,
  projectAssignment
}: RecordDetailsSheetProps) {
  const formatLabel = (label: string) => {
    return label.replace(/_/g, " ").toUpperCase()
  }

  const formatDate = (dateValue: string | null | undefined) => {
    if (!dateValue) return "—"

    const parsedDate = new Date(dateValue)
    if (Number.isNaN(parsedDate.getTime())) return dateValue

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsedDate)
  }

  const formatDateRange = (startDate: string | null | undefined, endDate: string | null | undefined) => {
    return `${formatDate(startDate)} - ${endDate ? formatDate(endDate) : "Present"}`
  }

  const assignments = employeeAssignment ?? []
  const teamAssignments = projectAssignment ?? []
  const currentAssignment = assignments[0]
  const employee = currentAssignment?.employees
  const currentProject = currentAssignment?.projects
  const currentProjectTeamAssignments = teamAssignments.filter(
    (assignment) => !currentProject?.id || assignment.projects?.id === currentProject.id
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] p-[20px] flex flex-col">
        <SheetHeader>
          <div className="flex flex-row items-center justify-start mb-[5px]">
            <SheetTitle className="font-rethink hidden">Record Details</SheetTitle>
            <SheetDescription className="hidden font-rethink"></SheetDescription>
            <div className="size-[50px] bg-[#FAFAFA] rounded-[10px] flex items-center justify-center mr-4">
              <Image src={usericon} alt="user icon" className="size-[26px]" />
            </div>
            <div className=" flex flex-col items-start justify-center gap-1">
              <div className="font-rethink text-[22px] font-semibold mb-0 leading-none">{selectedRow?.original?.employee_name || ""}</div>
              <div className="flex flex-row items-center justify-center leading-none">
                <Image src={mail} alt="mail icon" className="size-[15px] mr-2" />
                <span className="font-rethink text-[12px] font-medium text-[#909090] leading-none">{selectedRow?.original?.employee_email || ""}</span>
              </div>
            </div>
          </div>
        </SheetHeader>

        {isLoading ? (//skeleton loading state while fetching record details
          <div className="flex flex-col gap-4 mt-4">
            <Skeleton className="h-8 w-full rounded-[6px]" />
            <Skeleton className="h-32 w-full rounded-[6px]" />
            <Skeleton className="h-32 w-full rounded-[6px]" />
          </div>
        ) 
        // If not loading and fetch worked, show the details in tabs
        : 
        assignments.length > 0 ? (
          <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid w-full grid-cols-3 items-center justify-center">
                <TabsTrigger value="details" className="h-full w-full font-rethink font-bold !text-[14px]">Details</TabsTrigger>
                <TabsTrigger value="project" className="h-full w-full font-rethink font-bold !text-[14px]">Project Details</TabsTrigger>
                <TabsTrigger value="assignments" className="h-full w-full font-rethink font-bold !text-[14px]">Assignments</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="flex-1 overflow-y-auto mt-[10px] ml-[5px]">
              {employee?.custom_profile && employee.custom_profile.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {employee.custom_profile
                    .map((field) => {
                      return (
                        <div key={field.id}>
                          <p className="font-rethink text-[11px] font-medium text-[#909090] uppercase tracking-wider">
                            {formatLabel(field.label)}
                          </p>
                          <p className="font-rethink text-[14px] font-bold text-black">
                            {field.value == null || field.value === "" ? "—" : String(field.value)}
                          </p>
                        </div>
                      )
                    })}
                </div>
              )}

              {assignments.length > 0 ? (
                <>
                  <div className="mt-[15px] w-auto rounded-[10px] flex flex-col border-[1.5px] border-[#f2f2f2] bg-[#f9f9f9] ">
                    <div className="tracking-wider flex flex-row items-center justify-start px-[10px] py-[5px] rounded-t-[8px]">
                      <Image src={cube} alt="cube icon" className="size-[15px] inline-block mr-2" />
                      <span className="font-rethink text-[12px] font-medium text-[#575757] ">ASSIGNMENT DETAILS</span>
                    </div>
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className="rounded-[10px] border-t-[1px] border-[#eaeaea] bg-white">
                        <p className="px-[10px] py-[10px] font-rethink text-[16px] font-bold border-dashed border-b-[1.5px] border-[#e0d8d8]">{assignment.projects?.name || "—"}</p>
                        <div className="flex flex-col gap-3 mt-1 px-[10px] py-[8px]">
                          <div className="flex flex-row items-center justify-start">
                            <AllocationProgressBar percentage={assignment.allocation_percentage} />
                          </div>
                          <div className="flex flex-row items-center justify-start">
                            <Image src={calendar} alt="calendar icon" className="size-[15px] mr-[5px]" />
                            <span className="font-rethink font-semibold text-[14px] text-[#575757]">{formatDateRange(assignment.start_date, assignment.end_date)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="font-rethink text-[14px] text-[#686868]">No other project assignments</p>
              )}
            </TabsContent>

            <TabsContent value="project" className="flex-1 overflow-y-auto mt-4">
              <div className="space-y-4">
                <div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="font-rethink text-[11px] font-medium text-[#909090] uppercase tracking-wider">NAME</p>
                      <p className="font-rethink text-[14px] font-medium text-black">{currentProject?.name || "—"}</p>
                    </div>
                  </div>
                </div>

                {currentProject?.meta && currentProject.meta.length > 0 && (
                  <div>
                    <div className="grid grid-cols-2 gap-3">
                      {currentProject.meta.map((field) => (
                        <div key={field.id}>
                          <p className="font-rethink text-[11px] font-medium text-[#909090] uppercase tracking-wider">
                            {formatLabel(field.label)}
                          </p>
                          <p className="font-rethink text-[14px] font-medium text-black">
                            {field.value == null || field.value === "" ? "—" : String(field.value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-rethink text-[11px] font-medium mt-4 text-[#909090]">TEAM MEMBERS</h3>
                  {currentProjectTeamAssignments.length > 0 ? (
                    <div className="space-y-2 mt-[5px]">
                      {currentProjectTeamAssignments.map((assignment) => (
                        <div key={assignment.id} className="p-3 bg-[#fafafa] rounded-[8px]">
                          <p className="font-rethink text-[14px] font-medium">
                            {assignment.employees?.system_profile?.name || "—"}
                          </p>
                          <div className="mt-2">
                            <AllocationProgressBar percentage={assignment.allocation_percentage} />
                          </div>
                          <div className="flex gap-4 mt-1">
                            <span className="font-rethink text-[12px] text-[#686868]">
                              {formatDateRange(assignment.start_date, assignment.end_date)}
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

            <TabsContent value="assignments" className="flex-1 overflow-y-auto mt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-rethink text-[11px] font-medium mb-3 text-[#909090]">CURRENT ASSIGNMENT</h3>
                  <div className="p-3 bg-[#fafafa] rounded-[8px]">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-rethink text-[14px] font-medium">
                          {currentProject?.name || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-2">
                      <AllocationProgressBar percentage={selectedRow?.original?.allocation_percentage ?? 0} />
                      <span className="font-rethink text-[12px] text-[#686868]">
                        {formatDateRange(selectedRow?.original?.start_date, selectedRow?.original?.end_date)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-rethink text-[11px] font-medium mb-3 text-[#909090]">
                    ALL ASSIGNMENTS FOR {employee?.system_profile?.name.toUpperCase() || "EMPLOYEE"}
                  </h3>
                  {assignments.length > 0 ? (
                    <div className="space-y-2">
                      {assignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className={`p-3 rounded-[8px] ${assignment.projects?.id === currentProject?.id ? 'bg-[#fafafa]' : 'bg-[#fafafa]'}`}
                        >
                          <p className="font-rethink text-[14px] font-medium">{assignment.projects?.name || "—"}</p>
                          <div className="mt-2">
                            <AllocationProgressBar percentage={assignment.allocation_percentage} />
                          </div>
                          <div className="flex gap-4 mt-1">
                            <span className="font-rethink text-[12px] text-[#686868]">
                              {formatDateRange(assignment.start_date, assignment.end_date)}
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
        ) 
        : 
        // If not loading and no record details, fetch rows from the table and show error message
        (
          <div className="grid grid-cols-2 overflow-y-auto mt-4">
            {selectedRow &&
              selectedRow.getVisibleCells().map((cell: any) => {
                const header = cell.column.columnDef.header
                return (
                    <div key={cell.id} className="">
                        <h3 className="font-rethink text-[11px] font-medium text-[#909090] uppercase tracking-wider">
                        {typeof header === "string" ? header : cell.column.id.replace(/_/g, " ")}
                        </h3>
                        <div className="font-rethink text-[14px] font-medium text-black mb-[20px]">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                    </div>
                )
            })}
            <div className="col-span-2 p-[20px] flex flex-row items-center justify-center">
                <Image src={erroricon} alt="error icon" className="size-[20px] mr-2" />
                <span className="font-rethink font-semibold text-[14px] text-red-500">Couldn&apos;t display details for {selectedRow?.original?.employee_name || "this employee"}</span>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
