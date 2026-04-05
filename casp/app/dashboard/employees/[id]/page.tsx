"use client";

import { qrcodeDataURI } from "etiket";
import { motion } from "motion/react";
import { useSidebar } from "@/components/ui/sidebar";
import { useAiPanelStore } from "@/zustand-global-storage";

function QR({ url }: { url: string }) {
  return <img src={qrcodeDataURI(url, {
    margin: 0,
    dotType: "dots",
    dotSize:1,
    color: "#000000",
  })} alt="QR Code" width={65} height={65} />;
}

type PageProps = {
  params: { id: string }
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <input
        title={label}
        placeholder={label}
        defaultValue={value}
        className="h-9 w-full rounded-xl border border-[#d9d9d9] px-3 text-[14px]"
      />
    </label>
  )
}

export default function EmployeeDetailPage({ params }: PageProps) {
  const { id } = params
  const { open: isSidebarOpen } = useSidebar()
  const isAiPanelOpen = useAiPanelStore((state) => state.isAiPanelOpen)
  const hideEmployeeCard = isSidebarOpen && isAiPanelOpen

  const existingRecord = {
    employee: {
      name: "Sarah Williams",
      email: "sarah.williams@company.com",
      role: "employee",
      status: "Partially Occupied",
      department: "Engineering",
      location: "Mumbai",
    },
    assignment: {
      projectName: "Website Redesign",
      allocationPercentage: "60",
      startDate: "2026-01-20",
      endDate: "2026-09-30",
    },
    projectMeta: {
      client: "Acme Corp",
      priority: "High",
      billingType: "Billable",
    },
    teamMember: {
      name: "John Doe",
      allocationPercentage: "40",
      startDate: "2026-01-20",
      endDate: "2026-09-30",
    },
  }

  return (
    <div className="flex w-full gap-6 px-6 pt-4">
      <div className={hideEmployeeCard ? "w-full space-y-4" : "w-1/2 space-y-4"}>
        <h1 className="font-rethink text-[24px] font-medium">Employee Details</h1>

        <div className="space-y-2 rounded-xl border border-[#e5e5e5] p-4">
          <h2 className="font-rethink text-[13px] font-semibold text-[#606060]">Basic Info</h2>
          <Field label="Employee Name" value={existingRecord.employee.name} />
          <Field label="Employee Email" value={existingRecord.employee.email} />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Role" value={existingRecord.employee.role} />
            <Field label="Status" value={existingRecord.employee.status} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Department" value={existingRecord.employee.department} />
            <Field label="Location" value={existingRecord.employee.location} />
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-[#e5e5e5] p-4">
          <h2 className="font-rethink text-[13px] font-semibold text-[#606060]">Assignment Details</h2>
          <Field label="Project Name" value={existingRecord.assignment.projectName} />
          <div className="grid grid-cols-3 gap-2">
            <Field label="Allocation %" value={existingRecord.assignment.allocationPercentage} />
            <Field label="Start Date" value={existingRecord.assignment.startDate} />
            <Field label="End Date" value={existingRecord.assignment.endDate} />
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-[#e5e5e5] p-4">
          <h2 className="font-rethink text-[13px] font-semibold text-[#606060]">Project Details</h2>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Client" value={existingRecord.projectMeta.client} />
            <Field label="Priority" value={existingRecord.projectMeta.priority} />
            <Field label="Billing Type" value={existingRecord.projectMeta.billingType} />
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-[#e5e5e5] p-4">
          <h2 className="font-rethink text-[13px] font-semibold text-[#606060]">Team Member</h2>
          <Field label="Team Member Name" value={existingRecord.teamMember.name} />
          <div className="grid grid-cols-3 gap-2">
            <Field label="Team Allocation %" value={existingRecord.teamMember.allocationPercentage} />
            <Field label="Team Start Date" value={existingRecord.teamMember.startDate} />
            <Field label="Team End Date" value={existingRecord.teamMember.endDate} />
          </div>
        </div>
      </div>

      {/* Employee Card with QR Code */}
      {!hideEmployeeCard && <div className="flex w-1/2 items-center justify-center">
        <motion.div
          className="relative h-[390px] w-[250px] flex items-center justify-center"
          initial="rest"
          whileHover="hover"
          animate="rest"
          variants={{
            rest: { scale: 1, rotate: 0 },
            hover: { scale: 1.02, rotate: -1 },
          }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
        > 
          
          {/* 2. The Back Card */}
          <motion.div
            className="absolute top-0 left-0 z-0 flex h-[390px] w-[250px] origin-center flex-col items-start justify-end rounded-xl bg-black pl-[35px] pb-[20px] shadow-2xl"
            variants={{
              rest: { rotate: 5, x: 0, y: 0 },
              hover: { rotate: 9, x: -10, y: -6 },
            }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[50px] h-[12px] bg-white rounded-[20px] shadow-[inset_0_2px_4px_1px_rgba(127,127,127,0.25)]"></div>
            <h1 className="font-rethink text-[70px] font-bold leading-[10px] text-white [writing-mode:vertical-lr] rotate-180">
              acme inc
            </h1>
          </motion.div>

          {/* The Front Card */}
          <motion.div
            className="relative z-10 flex h-[390px] w-[250px] flex-col items-center justify-center overflow-hidden rounded-xl bg-[url('/assets/woman.jpg')] bg-cover bg-center shadow-2xl"
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
              className="absolute top-4 left-1/2 -translate-x-1/2 w-[50px] h-[12px] bg-white rounded-[20px] shadow-[inset_0_2px_4px_1px_rgba(127,127,127,0.25)]"
              variants={{
                rest: { scaleX: 1, opacity: 0.85 },
                hover: { scaleX: 1.25, opacity: 1 },
              }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
            
            <motion.div
              className="absolute bottom-0 left-0 right-0 flex h-[90px] items-center justify-between border-t border-[#d1cdcd] bg-white py-[12px] px-[12px]"
              variants={{
                rest: { y: 0 },
                hover: { y: 4 },
              }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
            >
              <div className="flex flex-col gap-1 text-left">
                <p className="font-rethink text-[22px] font-medium leading-[22px]">Sarah <br />Williams</p>
                <p className="font-rethink text-[13px] text-[#484848]">employee</p>
              </div>
              <QR url={`https://localhost:3000/dashboard/employee/${id}`} />
            </motion.div>
          </motion.div>

        </motion.div>
      </div>}
    </div>
  )
}