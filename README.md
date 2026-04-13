# CASP

CASP is a workforce management platform designed to help organizations manage employees, projects, and allocation assignments with a fast dashboard experience, schema-driven onboarding, and near real-time synchronized data.

## What I Built

- A full-stack web app using Next.js App Router and TypeScript.
- Supabase-based authentication, authorization, and PostgreSQL data storage.
- Near real-time table synchronization using Electric SQL shape endpoints.
- A separate Go service for bulk Excel imports into the same data model.
- A schema-driven onboarding flow that customizes employee/project fields per organization.

## Core Technologies

### Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Radix UI primitives + custom UI components
- React Hook Form + Zod (form state and validation)
- TanStack React Query (query client/provider)
- TanStack React DB + Electric DB Collection (live collections)
- Zustand (lightweight global UI/app state)

### Backend (within Next.js)

- Next.js Route Handlers (`app/api/...`)
- Supabase SSR client (`@supabase/ssr`) for auth/session-aware server operations
- Supabase Admin client (service role) for privileged operations


