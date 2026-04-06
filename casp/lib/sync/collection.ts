import { createCollection } from "@tanstack/react-db"
import { electricCollectionOptions } from "@tanstack/electric-db-collection"

export type SystemProfile = {
  name: string
  email: string
}

export type CustomProfile = {
  id: string
  label?: string
  value: string | null
}

export type Employee = {
  id: string
  auth_user_id: string | null
  created_at: string
  custom_profile: CustomProfile[] | null
  organization_id: string
  role: string
  status: string
  system_profile: SystemProfile | null
}

const appUrl = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

const employeeShapeUrl = new URL("/api/sync/employee", appUrl).toString()

export const employeeCollection = createCollection(
  electricCollectionOptions({
    id: "employees",
    shapeOptions: {
      url: employeeShapeUrl,
      params: {
        table: "employees",
      },
      onError: (error) => {
        console.error("Employee sync error:", error)
      },
    },
    getKey: (employee: Employee) => employee.id,

    onUpdate: async ({ transaction }) => {
      const mutation = transaction.mutations[0]
      const response = await fetch("/api/database_update/updateEmployee", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: mutation.original.id,
          changes: mutation.changes,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.error ?? "Failed to update employee")
      }
    },
  })
)
