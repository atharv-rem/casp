"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useLiveQuery } from "@tanstack/react-db"
import { projectCollection, type Project } from "@/lib/sync/collection"

type ProjectSyncContextValue = {
  projects: Project[]
  isLoading: boolean
  isError: boolean
}

const ProjectSyncContext = createContext<ProjectSyncContextValue | null>(null)

export function ProjectSyncProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // The provider stays on the fallback tree until the client has mounted.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <ProjectSyncContext.Provider
        value={{ projects: [], isLoading: true, isError: false }}
      >
        {children}
      </ProjectSyncContext.Provider>
    )
  }

  return <ProjectSyncProviderInner>{children}</ProjectSyncProviderInner>
}

function ProjectSyncProviderInner({
  children,
}: {
  children: React.ReactNode
}) {
  const { data = [], isLoading, isError } = useLiveQuery(
    (q) => q.from({ projects: projectCollection }),
    []
  )

  return (
    <ProjectSyncContext.Provider
      value={{ projects: data, isLoading, isError }}
    >
      {children}
    </ProjectSyncContext.Provider>
  )
}

export function useProjectSync() {
  const context = useContext(ProjectSyncContext)

  if (!context) {
    throw new Error("useProjectSync must be used within ProjectSyncProvider")
  }

  return context
}
