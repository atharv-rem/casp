"use client"

import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useProjectSync } from "../../components/sync-provider"
import { projectCollection } from "@/lib/sync/collection"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { TextShimmer } from "@/components/ui/shimmer"
import UnicodeSpinner from "@/app/global components/unicode_spinner"
import projectIcon from "@/public/assets/project.svg"
import userIcon from "@/public/assets/user icon.svg"
import mailIcon from "@/public/assets/mail grey.svg"
import { useRouter } from "next/navigation"

type ProjectField = {
  id: string
  key: string
  type: string
  label: string
  required: boolean
}

type Assignment = {
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

function Field({
  label,
  name,
  value,
}: {
  label: string
  name: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-[5px]">
      <span className="font-rethink text-[12px] font-medium lowercase tracking-wider text-[#909090]">
        {label}
      </span>
      <Input
        title={label}
        name={name}
        placeholder={label}
        defaultValue={value}
        className="h-9 rounded-[10px] border-[#ededed] px-3 text-[14px]"
      />
    </div>
  )
}

function normalizeProjectMeta(
  value: unknown
): Array<{ id: string; label?: string; value: string | null }> {
  if (Array.isArray(value)) {
    return value as Array<{ id: string; label?: string; value: string | null }>
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  return []
}

function formatAssignmentDate(value: string | null | undefined) {
  if (!value) return ""
  const [dateOnly] = value.split("T")
  return dateOnly ?? ""
}

const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>, id: string) => {
  e.preventDefault()

  const data = Object.fromEntries(new FormData(e.currentTarget))

  await projectCollection.update(id, (draft) => {
    const projectDraft = draft as unknown as {
      name: string
      meta: Array<{ id: string; label?: string; value: string | null }> | null
    }

    projectDraft.name = String(data.name ?? "")
    projectDraft.meta =
      projectDraft.meta?.map(
        (field: { id: string; label?: string; value: string | null }) => ({
          ...field,
          value: String(data[field.id] ?? field.value ?? ""),
        })
      ) ?? []
  })
}

const handleAssignmentSubmit = async (
  e: React.FormEvent<HTMLFormElement>,
  assignments: Assignment[],
  onSaved: () => Promise<unknown>
) => {
  e.preventDefault()

  const data = new FormData(e.currentTarget)

  await Promise.all(
    assignments.map(async (assignment) => {
      const allocationValue = data.get(`allocation_percentage_${assignment.id}`)
      const startDateValue = data.get(`start_date_${assignment.id}`)
      const endDateValue = data.get(`end_date_${assignment.id}`)

      const response = await fetch("/api/database_update/updateEmployeeProjectAssignment", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: assignment.id,
          changes: {
            allocation_percentage: Number(String(allocationValue ?? assignment.allocation_percentage ?? 0)),
            start_date: String(startDateValue ?? formatAssignmentDate(assignment.start_date)),
            end_date: String(endDateValue ?? "").trim() || null,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update assignment")
      }
    })
  )

  await onSaved()
}

export default function ProjectDetail({
  projectId,
  projectSchema,
}: {
  projectId: string
  projectSchema: ProjectField[]
}) {
  const router = useRouter()
  const [isSavingAssignments, setIsSavingAssignments] = useState(false)
  const { projects, isLoading, isError } = useProjectSync()
  const project = projects.find((item) => item.id === projectId)

  const { data: assignments = [], isLoading: assignmentsLoading, refetch: refetchAssignments } = useQuery({
    queryKey: ["project-details", projectId],
    queryFn: async () => {
      const response = await fetch(
        `/api/database_fetch/getProjectsAssignedToEmployees?projectId=${projectId}`
      )

      if (!response.ok) {
        throw new Error("Failed to fetch project assignments")
      }

      return response.json()
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex items-center gap-2">
          <UnicodeSpinner name="orbit" />
          <TextShimmer
            className="font-rethink text-sm font-semibold"
            colors={["transparent", "rgb(150, 150, 150)", "transparent"]}
          >
            Loading project...
          </TextShimmer>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-full w-full items-center justify-center font-rethink text-2xl text-red-600">
        Failed to load project.
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex h-full w-full items-center justify-center font-rethink text-2xl text-gray-600">
        Project not found.
      </div>
    )
  }

  const schemaById = new Map(projectSchema.map((field) => [field.id, field.label]))
  const customMeta = normalizeProjectMeta(project.meta)

  return (
    <div className="flex h-full w-full gap-6 px-6 pb-4 pt-4">
      <div className="h-[calc(100dvh-60px)] w-1/2 overflow-y-auto rounded-[10px] border-[2px] border-t-0 border-[#fafafa] mt-[5px]">
        <div className="max-w-[1280px] overflow-hidden bg-white">
          <div className="h-[100px] rounded-t-[10px] bg-[#fafafa]" />
          <div className="-mt-12 px-4 pb-2">
            <div className="size-25 rounded-full border-5 border-white bg-gray-200" />
          </div>
          <div className="mx-4 rounded-[10px] border border-[#f0f0f0] bg-[#fafafa] p-3 px-4 font-rethink text-[12px] leading-[14px] font-regular text-black">
            <span>
              click on any field to edit it. once you are satisfied, click the &quot;Save Changes&quot; button.
            </span>
          </div>
          <form onSubmit={(e) => handleSubmit(e, projectId)}>
            <div className="space-y-4 p-4">
              <Field label="project name" name="name" value={project.name ?? ""} />
              <div className="grid grid-cols-2 gap-x-4">
                {customMeta.map((field) => (
                  <Field
                    key={field.id}
                    label={schemaById.get(field.id) ?? field.label ?? field.id}
                    name={field.id}
                    value={field.value ?? ""}
                  />
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="mb-[10px] ml-4 mt-[10px] rounded-[10px] bg-[#f0f0f0] px-4 py-[3px] font-rethink font-semibold text-black transition hover:bg-[#e0e0e0]"
            >
              Save Changes
            </button>
          </form>

          <Separator className="!h-[3px] my-[10px] bg-[#fafafa]" />

          <div className="px-4 pb-4">
            <div className="mb-3 flex items-center gap-2">
              <Image src={projectIcon} alt="project icon" className="size-[18px]" />
              <h2 className="font-rethink text-[16px] font-semibold">Project Team</h2>
            </div>
            {assignmentsLoading ? (
              <div className="flex items-center gap-2">
                <UnicodeSpinner name="orbit" />
                <TextShimmer
                  className="font-rethink text-sm font-semibold"
                  colors={["transparent", "rgb(150, 150, 150)", "transparent"]}
                >
                  Loading assignments...
                </TextShimmer>
              </div>
            ) : assignments.length > 0 ? (
              <form
                onSubmit={async (e) => {
                  setIsSavingAssignments(true)
                  try {
                    await handleAssignmentSubmit(e, assignments, refetchAssignments)
                  } finally {
                    setIsSavingAssignments(false)
                  }
                }}
                className="space-y-3"
              >
                {assignments.map((assignment: Assignment) => (
                  <div
                    key={assignment.id}
                    className="rounded-[10px] border border-[#ededed] bg-white p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Image src={userIcon} alt="user icon" className="size-[14px]" />
                      <span className="font-rethink text-[14px] font-medium">
                        {assignment.employees?.system_profile?.name || "—"}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <Image src={mailIcon} alt="email icon" className="size-[14px]" />
                      <span className="font-rethink text-[12px] text-[#909090]">
                        {assignment.employees?.system_profile?.email || "—"}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        name={`allocation_percentage_${assignment.id}`}
                        defaultValue={assignment.allocation_percentage ?? ""}
                        className="rounded-[8px] border border-[#e5e5e5] px-3 py-1.5 font-rethink text-[13px]"
                      />
                      <Input
                        type="date"
                        name={`start_date_${assignment.id}`}
                        defaultValue={formatAssignmentDate(assignment.start_date)}
                        className="rounded-[8px] border border-[#e5e5e5] px-3 py-1.5 font-rethink text-[13px]"
                      />
                      <Input
                        type="date"
                        name={`end_date_${assignment.id}`}
                        defaultValue={formatAssignmentDate(assignment.end_date)}
                        className="rounded-[8px] border border-[#e5e5e5] px-3 py-1.5 font-rethink text-[13px]"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={isSavingAssignments}
                  className="mt-[10px] rounded-[10px] bg-[#f0f0f0] px-4 py-[3px] font-rethink font-semibold text-black transition hover:bg-[#e0e0e0]"
                >
                  {isSavingAssignments ? "Saving..." : "Save Assignment Changes"}
                </button>
              </form>
            ) : (
              <p className="rounded-[10px] border border-dashed border-[#eaeaea] bg-[#f9f9f9] px-[10px] py-[8px] font-rethink text-[14px] text-[#686868]">
                No team members assigned
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100dvh-60px)] w-1/2 flex-col items-center justify-center dotted-bg">
        <div className="relative flex h-[370px] w-[230px] items-center justify-center">
          <div className="absolute top-0 left-0 z-0 flex h-[370px] w-[230px] origin-center flex-col items-start justify-end rounded-xl bg-black pl-[35px] pb-[20px] shadow-2xl">
            <div className="absolute top-4 left-1/2 h-[12px] w-[50px] -translate-x-1/2 rounded-[20px] bg-white shadow-[inset_0_2px_4px_1px_rgba(127,127,127,0.25)]" />
            <h1 className="font-rethink text-[70px] font-bold leading-[10px] text-white [writing-mode:vertical-lr] rotate-180">
              acme inc
            </h1>
          </div>

          <div
            className="relative z-10 flex h-[370px] w-[230px] flex-col items-center justify-center overflow-hidden rounded-xl bg-white shadow-2xl"
            style={{ backgroundColor: "#ffffff" }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 30% 18%, rgba(255,255,255,0.35), rgba(255,255,255,0) 55%)",
              }}
            />
            <div
              className="pointer-events-none absolute inset-y-0 left-[-45%] w-[40%] skew-x-[-22deg]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0) 100%)",
              }}
            />
            <div className="absolute top-4 left-1/2 h-[12px] w-[50px] -translate-x-1/2 rounded-[20px] bg-white shadow-[inset_0_2px_4px_1px_rgba(127,127,127,0.25)]" />
            <div className="absolute bottom-0 left-0 right-0 flex h-[80px] items-center justify-between border-t border-[#d1cdcd] bg-white px-[12px] py-[12px]">
              <div className="flex flex-col gap-1 text-left">
                <p className="font-rethink text-[19px] font-medium leading-[19px]">
                  {project.name.split(" ")[0] || "—"}
                  <br />
                  {project.name.split(" ")[1] || ""}
                </p>
                <p className="font-rethink text-[12px] text-[#484848]">project</p>
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!projectId) return
            router.push(`/dashboard/projects/id?projectId=${projectId}`)
          }}
          className="mt-4 rounded-[10px] border border-[#ededed] bg-white px-4 py-2 font-rethink text-[14px] font-medium"
        >
          Edit project
        </button>
      </div>
    </div>
  )
}
