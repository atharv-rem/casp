"use client"

import {use} from "react"
import { qrcodeDataURI } from "etiket"
import { motion } from "motion/react"
import { useSidebar } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { useAiPanelStore } from "@/zustand-global-storage"
import { useEmployeeSync } from "../components/sync-provider"
import  { employeeCollection } from "@/lib/sync/collection"

function QR({ url }: { url: string }) {
  return (
    <img
      src={qrcodeDataURI(url, {
        margin: 0,
        dotType: "dots",
        dotSize: 1,
        color: "#000000",
      })}
      alt="QR Code"
      width={60}
      height={60}
    />
  )
}

type PageProps = {
  params: Promise<{ id: string }>
}

function Field({ label,name, value }: { label: string; name: string; value: string }) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <Input
        title={label}
        name={name}
        placeholder={label}
        defaultValue={value}
        className="h-9 rounded-[10px] border-[#ededed] px-3 text-[14px]"
      />
    </label>
  )
}

function normalizeSystemProfile(value: unknown): Record<string, string> | null {
  if (!value) return null

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return parsed && typeof parsed === "object" ? parsed : null
    } catch {
      return null
    }
  }

  if (typeof value === "object") {
    return value as Record<string, string>
  }

  return null
}

function normalizeCustomProfile(value: unknown): Array<{ id: string; label?: string; value: string | null }> {
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

const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>, id: string) => {
  e.preventDefault()

  const data = Object.fromEntries(new FormData(e.currentTarget))

  await employeeCollection.update(id, (draft) => {
    draft.role = String(data.role ?? "")
    draft.status = String(data.status ?? "")
    draft.system_profile = {
      name: String(data.name ?? ""),
      email: String(data.email ?? ""),
    }
    draft.custom_profile =
      draft.custom_profile?.map((field) => ({
        ...field,
        value: String(data[field.id] ?? field.value ?? ""),
      })) ?? null
  })
}

export default function EmployeeDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const { open: isSidebarOpen } = useSidebar()
  const isAiPanelOpen = useAiPanelStore((state) => state.isAiPanelOpen)
  const hideEmployeeCard = isSidebarOpen && isAiPanelOpen

  const { employees, isLoading, isError } = useEmployeeSync()
  const employee = employees.find((item) => item.id === id)

  if (isLoading) {
    return <div className="flex w-full h-full font-rethink text-2xl items-center justify-center text-gray-600">Loading employee...</div>
  }

  if (isError) {
    return <div className="flex w-full h-full font-rethink text-2xl  text-red-600 items-center justify-center">Failed to load employee.</div>
  }

  if (!employee) {
    return <div className="flex w-full h-full font-rethink text-2xl text-gray-600 items-center justify-center">Employee not found.</div>
  }

  const systemProfile = normalizeSystemProfile(employee.system_profile)
  const customProfile = normalizeCustomProfile(employee.custom_profile)

  return (
    <div className="flex w-full h-full gap-6 px-6 pt-4 pb-4">
      <div className={hideEmployeeCard ? "w-full border-t-0 rounded-[10px] border-[2px] border-[#fafafa] mt-[5px] h-[calc(100dvh-60px)] overflow-y-auto" : "w-1/2 border-t-0 border-[2px] rounded-[10px] border-[#fafafa] mt-[5px] h-[calc(100dvh-60px)] overflow-y-auto"}>
        <div className="max-w-[1280px] overflow-hidden bg-white">
          <div className="h-[100px] bg-[#fafafa] rounded-t-[10px]" />
          <div className="px-4 pb-2 -mt-12">
            <div className="w-25 h-25 rounded-full bg-gray-200 border-5 border-white" />           
          </div>
          <form onSubmit={(e)=>handleSubmit(e,id)}>
            <div className="space-y-2 p-4">
              <h2 className="font-rethink text-[13px] font-semibold text-[#606060]">Basic Info</h2>
              <Field
                label="Employee Name"
                name="name"
                value={typeof systemProfile?.name === "string" ? systemProfile.name : ""}
              />
              <Field
                label="Employee Email"
                name="email"
                value={typeof systemProfile?.email === "string" ? systemProfile.email : ""}
              />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Role" name="role" value={employee.role ?? ""} />
                <Field label="Status" name="status" value={employee.status ?? ""} />
              </div>
            </div>

            <div className="space-y-2 p-4">
              <h2 className="font-rethink text-[13px] font-semibold text-[#606060]">Custom Fields</h2>
              <div className="grid grid-cols-2 gap-2">
                {customProfile.map((field) => (
                  <Field
                    key={field.id}
                    label={field.label ?? field.id}
                    name={field.id}
                    value={field.value ?? ""}
                  />
                ))}
              </div>
            </div>
            <button type="submit" className="mb-4 ml-4 px-4 py-2 bg-black text-white transition rounded-[10px] hover:bg-gray-800">
              Save Changes
            </button>
          </form>
        </div>
      </div>

      {!hideEmployeeCard && (
        <div className="flex flex-col w-1/2 h-[calc(100dvh-60px)] items-center justify-center dotted-bg">
          <motion.div
            className="relative h-[370px] w-[230px] flex items-center justify-center"
            initial="rest"
            whileHover="hover"
            animate="rest"
            variants={{
              rest: { scale: 1, rotate: 0 },
              hover: { scale: 1.02, rotate: -1 },
            }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
          >
            <motion.div
              className="absolute top-0 left-0 z-0 flex h-[370px] w-[230px] origin-center flex-col items-start justify-end rounded-xl bg-black pl-[35px] pb-[20px] shadow-2xl"
              variants={{
                rest: { rotate: 5, x: 0, y: 0 },
                hover: { rotate: 9, x: -10, y: -6 },
              }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <div className="absolute top-4 left-1/2 h-[12px] w-[50px] -translate-x-1/2 rounded-[20px] bg-white shadow-[inset_0_2px_4px_1px_rgba(127,127,127,0.25)]" />
              <h1 className="font-rethink text-[70px] font-bold leading-[10px] text-white [writing-mode:vertical-lr] rotate-180">
                acme inc
              </h1>
            </motion.div>

            <motion.div
              className="relative z-10 flex h-[370px] w-[230px] flex-col items-center justify-center overflow-hidden rounded-xl bg-[url('/assets/woman.jpg')] bg-cover bg-center shadow-2xl"
              variants={{
                rest: { opacity: 1, y: 0, rotate: 0 },
                hover: { opacity: 0.2, y: -6, rotate: -1.2 },
              }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
            >
              <motion.div
                className="pointer-events-none absolute inset-0"
                variants={{
                  rest: { opacity: 0 },
                  hover: { opacity: 1 },
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{
                  background:
                    "radial-gradient(circle at 30% 18%, rgba(255,255,255,0.35), rgba(255,255,255,0) 55%)",
                }}
              />

              <motion.div
                className="pointer-events-none absolute inset-y-0 left-[-45%] w-[40%] skew-x-[-22deg]"
                variants={{
                  rest: { x: -220, opacity: 0 },
                  hover: { x: 320, opacity: 0.65 },
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                style={{
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0) 100%)",
                }}
              />

              <motion.div
                className="absolute top-4 left-1/2 h-[12px] w-[50px] -translate-x-1/2 rounded-[20px] bg-white shadow-[inset_0_2px_4px_1px_rgba(127,127,127,0.25)]"
                variants={{
                  rest: { scaleX: 1, opacity: 0.85 },
                  hover: { scaleX: 1.25, opacity: 1 },
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              />

              <motion.div
                className="absolute bottom-0 left-0 right-0 flex h-[80px] items-center justify-between border-t border-[#d1cdcd] bg-white px-[12px] py-[12px]"
                variants={{
                  rest: { y: 0 },
                  hover: { y: 4 },
                }}
                transition={{ type: "spring", stiffness: 250, damping: 20 }}
              >
                <div className="flex flex-col gap-1 text-left">
                  <p className="font-rethink text-[19px] font-medium leading-[19px]">
                    {(typeof systemProfile?.name === "string" ? systemProfile.name : "").split(" ")[0] || "—"}<br></br>
                    {(typeof systemProfile?.name === "string" ? systemProfile.name : "").split(" ")[1] || ""}
                  </p>
                  <p className="font-rethink text-[12px] text-[#484848]">{employee.role || "employee"}</p>
                </div>
                <QR url={`https://localhost:3000/dashboard/employees/${id}`} />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
