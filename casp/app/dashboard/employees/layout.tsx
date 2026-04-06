"use client"

import { EmployeeSyncProvider } from "./components/sync-provider"

export default function EmployeesLayout({children,}: {children: React.ReactNode}) {
  return <EmployeeSyncProvider>{children}</EmployeeSyncProvider>
}
