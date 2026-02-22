"use client"

import usericon from "@/public/assets/user icon.svg"
import mail from "@/public/assets/mail grey.svg"
import Image from "next/image"
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
            <TabsList className="grid w-full grid-cols-3 items-center justify-center py-[4px] px-[5px] shadow-xs h-[35px]">
              <TabsTrigger value="details" className="font-rethink font-bold text-[14px]">Details</TabsTrigger>
              <TabsTrigger value="project" className="font-rethink font-bold text-[14px]">Project Details</TabsTrigger>
              <TabsTrigger value="assignments" className="font-rethink font-bold text-[14px]">Assignments</TabsTrigger>
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
                  <h3 className="font-rethink text-[11px] font-medium mt-4 text-[#909090]">ASSIGNED PROJECTS</h3>
                  <div className="space-y-2 mt-[5px] w-auto">
                    {assignments.map((assignment) => (
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
