"use client"

import { useEffect, useState } from "react"
import { RecordsTable } from "./records-table"

type EmployeeFields = {
  id: string
  key: string
  type: string
  label: string
  required: boolean
}

type Props = {
  employeeSchema: EmployeeFields[]
}

export function RecordsTableClient({ employeeSchema }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full rounded-md border border-gray-200 p-4 text-sm text-gray-500">
        Loading records...
      </div>
    )
  }

  return <RecordsTable employeeSchema={employeeSchema} />
}
