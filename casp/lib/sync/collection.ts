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

export type Project = {
  id: string
  name: string
  organization_id: string
  created_at: string
  meta: Record<string, string>
}

export type EmployeeProjectAssignment = {
  id: string
  organization_id: string
  employee_id: string
  project_id: string
  allocation_percentage: number | null
  start_date: string
  end_date: string | null
  created_at: string
}

export type SchemaField = {
  id: string
  key: string
  type: string
  label: string
  required: boolean
}

export type EmployeeSchemaRow = {
  organization_id: string
  schema: {
    fields: SchemaField[]
  }
}

export type ProjectSchemaRow = {
  organization_id: string
  schema: {
    fields: SchemaField[]
  }
}


const appUrl = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

const employeeShapeUrl = new URL("/api/sync/employee", appUrl).toString()
const projectShapeUrl = new URL("/api/sync/project", appUrl).toString()
const assignmentShapeUrl = new URL("/api/sync/employee-project-assignment", appUrl).toString()
const employeeSchemaShapeUrl = new URL("/api/sync/employee-schema", appUrl).toString()
const projectSchemaShapeUrl = new URL("/api/sync/project-schema", appUrl).toString()


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

export const projectCollection = createCollection(
  electricCollectionOptions({
    id: "projects",
    shapeOptions: {
      url: projectShapeUrl,
      params: { table: "projects" },
      onError: (error) => {
        console.error("Project sync error:", error)
      },
    },
    getKey: (project: Project) => project.id,
    onUpdate: async ({ transaction }) => {
      const mutation = transaction.mutations[0]
      const response = await fetch("/api/database_update/updateProject", {
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
        throw new Error(error?.error ?? "Failed to update project")
      }
    },
  })
)

export const employeeProjectAssignmentCollection = createCollection(
  electricCollectionOptions({
    id: "employee-project-assignments",
    shapeOptions: {
      url: assignmentShapeUrl,
      params: {
        table: "employee_project_assignments",
      },
      onError: (error) => {
        console.error("Employee project assignment sync error:", error)
      },
    },
    getKey: (assignment: EmployeeProjectAssignment) => assignment.id,

    onUpdate: async ({ transaction }) => {
      const mutation = transaction.mutations[0]
      const response = await fetch("/api/database_update/updateEmployeeProjectAssignment", {
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
        throw new Error(error?.error ?? "Failed to update assignment")
      }
    },
  })
)

export const employeeSchemaCollection = createCollection(
  electricCollectionOptions({
    id: "employee-schemas",
    shapeOptions: {
      url: employeeSchemaShapeUrl,
      params: {
        table: "employee_schemas",
      },
      onError: (error) => {
        console.error("Employee schema sync error:", error)
      },
    },
    getKey: (row: EmployeeSchemaRow) => row.organization_id,

    onUpdate: async ({ transaction }) => {
      const mutation = transaction.mutations[0]

      const response = await fetch("/api/database_update/updateEmployeeSchema", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organization_id: mutation.original.organization_id,
          schema: mutation.modified.schema,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.error ?? "Failed to update employee schema")
      }
    },
  })
)

export const projectSchemaCollection = createCollection(
  electricCollectionOptions({
    id: "project-schemas",
    shapeOptions: {
      url: projectSchemaShapeUrl,
      params: {
        table: "project_schemas",
      },
      onError: (error) => {
        console.error("Project schema sync error:", error)
      },
    },
    getKey: (row: ProjectSchemaRow) => row.organization_id,

    onUpdate: async ({ transaction }) => {
      const mutation = transaction.mutations[0]

      const response = await fetch("/api/database_update/updateProjectSchema", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organization_id: mutation.original.organization_id,
          schema: mutation.modified.schema,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.error ?? "Failed to update project schema")
      }
    },
  })
)
