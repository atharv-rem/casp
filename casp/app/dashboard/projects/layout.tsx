"use client"

import { ProjectSyncProvider } from "./components/sync-provider"

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProjectSyncProvider>{children}</ProjectSyncProvider>
}
