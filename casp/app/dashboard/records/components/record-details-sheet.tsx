"use client"

import usericon from "@/public/assets/user icon.svg"
import mail from "@/public/assets/mail grey.svg"
import cube from "@/public/assets/cube.svg"
import calendar from "@/public/assets/calendar.svg"
import pie from "@/public/assets/piechart.svg"
import team from "@/public/assets/team.svg"
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
          <Tabs defaultValue="details" className="overflow-hidden flex flex-col">
            <TabsList className="inline-grid p-1 !bg-[#f9f9f9] w-full grid-cols-2 items-center justify-center">
              <TabsTrigger value="details" className="h-full font-rethink font-bold !text-[14px]">Employee Details</TabsTrigger>
              <TabsTrigger value="project" className="h-full font-rethink font-bold !text-[14px]">Project Details</TabsTrigger>
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
                          <div className="flex flex-row items-center justify-between px-[10px] py-[10px]">
                            <div className="flex flex-row items-center justify-start">
                              <Image src={pie} alt="allocation icon" className="size-[15px] mr-1" />
                              <div><span className="font-bold">{assignment.allocation_percentage}%</span> allocated</div>
                            </div>
                            <div className="flex flex-row items-center justify-end">
                              <Image src={calendar} alt="calendar icon" className="size-[15px] mr-1" />
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
              <div className="space-y-[25px]">
                {assignments.map((assignment, index) => {
                  const assignmentProject = assignment.projects
                  const projectTeamAssignments = teamAssignments.filter(
                    (teamAssignment) => !assignmentProject?.id || teamAssignment.projects?.id === assignmentProject.id
                  )

                  return (
                    <div key={assignment.id} className="grid grid-cols-2 border-[1.5px] border-[#f2f2f2] rounded-[10px]">

                      <div className="col-span-2 flex flex-row items-center justify-start px-[10px] py-[4px] rounded-t-[8px] bg-[#f9f9f9] border-dashed border-b-[1.5px] border-[#e0d8d8]">
                        <Image src={cube} alt="cube icon" className="size-[15px] inline-block mr-2" />
                        <div className="font-rethink text-[14px] font-medium text-[#575757]">PROJECT {index + 1}</div>
                      </div>
                      <div className="font-rethink text-[16px] font-bold text-black col-span-2 border-dashed border-b-[1.5px] border-[#e0d8d8]">
                        <p className="px-[10px] py-[5px]">{assignmentProject?.name || "—"}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 col-span-2 px-[10px] py-[5px] bg-[#f9f9f9] border-dashed border-b-[1.5px] border-[#e0d8d8]">
                        {assignmentProject?.meta && assignmentProject.meta.length > 0 && (
                          <>
                            {assignmentProject.meta.map((field) => (
                              <div key={field.id}>
                                <p className="font-rethink text-[11px] font-medium text-[#909090] uppercase tracking-wider">
                                  {formatLabel(field.label)}
                                </p>
                                <p className="font-rethink text-[14px] font-medium text-black">
                                  {field.value == null || field.value === "" ? "—" : String(field.value)}
                                </p>
                              </div>
                            ))}
                          </>
                        )}
                      </div>

                      <div className="col-span-2">
                        <div className="flex flex-row items-center justify-start py-[5px] px-[10px] border-dashed border-b-[1.5px] border-[#e0d8d8]">
                          <Image src={team} alt="team icon" className="size-[15px] inline-block mr-2" />
                          <h3 className="font-rethink text-[12px] font-medium text-[#575757]">TEAM MEMBERS</h3>
                        </div>
                        {projectTeamAssignments.length > 0 ? (
                          <div className="bg-[#f9f9f9] rounded-b-[10px]">
                            {projectTeamAssignments.map((teamAssignment) => (
                              <div key={teamAssignment.id} className="px-[10px] py-[10px] first:border-t-0 border-t-[1px] border-[#eaeaea]">
                                <div className="flex flex-row items-center justify-start">
                                  <Image src={usericon} alt="user icon" className="size-[12px] inline-block mr-2" />
                                  <p className="font-rethink text-[14px] font-medium">
                                    {teamAssignment.employees?.system_profile?.name || "—"}
                                  </p>
                                </div>
                                <div className="flex flex-row items-center justify-between mt-[5px]">
                                  <div className="flex flex-row items-center justify-start">
                                    <Image src={pie} alt="allocation icon" className="size-[14px] mr-1" />
                                    <div><span className="font-bold">{teamAssignment.allocation_percentage}%</span> allocated</div>
                                  </div>
                                  <div className="flex flex-row items-center justify-end">
                                    <Image src={calendar} alt="calendar icon" className="size-[14px] mr-1" />
                                    <span className="font-rethink font-semibold text-[14px] text-[#575757]">{formatDateRange(teamAssignment.start_date, teamAssignment.end_date)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="font-rethink text-[14px] text-[#686868]">No team members assigned</p>
                        )}
                      </div>
                    </div>
                  )
                })}
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
