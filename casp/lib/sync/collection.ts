import { createCollection } from '@tanstack/react-db'
import { electricCollectionOptions } from '@tanstack/electric-db-collection'

export type EmployeeSystemProfile = {
  name: string
  email: string
}

export type EmployeeCustomProfile = {
  id: string
  label?: string
  value: string | null
}

export type Employee = {
  id: string
  auth_user_id: string | null
  created_at: string
  custom_profile: EmployeeCustomProfile[] | null
  organization_id: string
  role: string
  status: string
  system_profile: EmployeeSystemProfile | null
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export const employeeCollection = createCollection(
  electricCollectionOptions({
    id: 'employeeCollection',
    shapeOptions: {
      url: '/api/sync/employee',
    },
    getKey: (employee: Employee) => employee.id,
  })
)
