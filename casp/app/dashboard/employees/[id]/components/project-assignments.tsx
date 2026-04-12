"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { employeeProjectAssignmentCollection } from "@/lib/sync/collection"
import { eq, useLiveQuery } from "@tanstack/react-db"

type ProjectAssignmentsProps = {
  employeeId: string
}

export default function ProjectAssignments({
  employeeId,
}: ProjectAssignmentsProps) {
  const {
    data: assignments = [],
    isLoading: assignmentsLoading,
    isError: assignmentsError,
  } = useLiveQuery(
    (q) =>
      q
        .from({ assignments: employeeProjectAssignmentCollection })
        .where(({ assignments }) => eq(assignments.employee_id, employeeId)),
    [employeeId]
  )

  const handleSaveChanges = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const data = new FormData(e.currentTarget)

    await Promise.all(
      assignments.map(async (assignment) => {
        const allocationValue = data.get(`allocation_percentage_${assignment.id}`)
        const startDateValue = data.get(`start_date_${assignment.id}`)
        const endDateValue = data.get(`end_date_${assignment.id}`)

        await employeeProjectAssignmentCollection.update(assignment.id, (draft) => {
          const parsedAllocation = Number(String(allocationValue ?? ""))

          if (!Number.isNaN(parsedAllocation)) {
            draft.allocation_percentage = parsedAllocation
          }

          draft.start_date = String(startDateValue ?? draft.start_date)

          const nextEndDate = String(endDateValue ?? "").trim()
          draft.end_date = nextEndDate === "" ? null : nextEndDate
        })
      })
    )
  }

  if (assignmentsLoading) {
    return (
      <div className="px-4 pb-4">
        <p>Loading assignments...</p>
      </div>
    )
  }

  if (assignmentsError) {
    return (
      <div className="px-4 pb-4">
        <p>Failed to load assignments.</p>
      </div>
    )
  }

  if (assignments.length === 0) {
    return (
      <div className="px-4 pb-4">
        <p>No project assignments.</p>
      </div>
    )
  }

  return (
    <div className="px-4 pb-4">
      <div className="flex flex-row items-center justify-between py-[10px]">
        <h2 className="font-rethink text-[14px] font-semibold text-[#909090]">
          Project Assignments
        </h2>
      </div>

      <form onSubmit={handleSaveChanges} className="space-y-4">
        {assignments.map((assignment) => {
          return (
            <div
              key={assignment.id}
              className="rounded-[10px] border border-[#ededed] px-3 py-2 space-y-3"
            >
              <p className="font-rethink text-[14px] font-semibold">
                Project ID: {assignment.project_id}
              </p>

              <Input
                type="number"
                min={0}
                max={100}
                name={`allocation_percentage_${assignment.id}`}
                defaultValue={assignment.allocation_percentage}
                className="w-full rounded-[8px] border border-[#e5e5e5] px-3 py-1.5 font-rethink text-[13px]"
              />

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <Input
                  type="date"
                  name={`start_date_${assignment.id}`}
                  defaultValue={assignment.start_date}
                  className="rounded-[8px] border border-[#e5e5e5] px-3 py-1.5 font-rethink text-[13px]"
                />

                <Input
                  type="date"
                  name={`end_date_${assignment.id}`}
                  defaultValue={assignment.end_date ?? ""}
                  className="rounded-[8px] border border-[#e5e5e5] px-3 py-1.5 font-rethink text-[13px]"
                />
              </div>
            </div>
          )
        })}

        <Button type="submit" className="font-rethink text-[13px]">
          Save Changes
        </Button>
      </form>
    </div>
  )
}
