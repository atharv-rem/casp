"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useLiveQuery } from "@tanstack/react-db"
import { employeeCollection, type Employee } from "@/lib/sync/collection"

type EmployeeSyncContextValue = {
  employees: Employee[]
  isLoading: boolean
  isError: boolean
}

const EmployeeSyncContext = createContext<EmployeeSyncContextValue | null>(null)

export function EmployeeSyncProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    console.log("EmployeeSyncProvider mounted")
    return () => console.log("EmployeeSyncProvider unmounted")
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <EmployeeSyncContext.Provider
        value={{ employees: [], isLoading: true, isError: false }}
      >
        {children}
      </EmployeeSyncContext.Provider>
    )
  }

  return <EmployeeSyncProviderInner>{children}</EmployeeSyncProviderInner>
}

function EmployeeSyncProviderInner({
  children,
}: {
  children: React.ReactNode
}) {
  const { data = [], isLoading, isError } = useLiveQuery(
    (q) => q.from({ employees: employeeCollection }),
    []
  )

  return (
    <EmployeeSyncContext.Provider
      value={{ employees: data, isLoading, isError }}
    >
      {children}
    </EmployeeSyncContext.Provider>
  )
}

export function useEmployeeSync() {
  const context = useContext(EmployeeSyncContext)

  if (!context) {
    throw new Error("useEmployeeSync must be used within EmployeeSyncProvider")
  }

  return context
}
