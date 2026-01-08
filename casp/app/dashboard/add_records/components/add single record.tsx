import { add_single_employee_record } from "@/app/dashboard/add_records/action";
import { add_single_project_record } from "@/app/dashboard/add_records/action";
import Image from "next/image";
import arrowRight from '@/public/assets/arrow icon.svg'
import React, { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Field {
  id: string;
  label: string;
  type?: string;
}

export default function AddSingleRecord({ orgId, empfields, projfields, projectList }: { orgId: string; empfields: Field[]; projfields: Field[]; projectList: any[] }) {
  const router = useRouter();
  const [empState, empFormAction, isEmpPending] = useActionState(add_single_employee_record, null);
  const [projState, projFormAction, isProjPending] = useActionState(add_single_project_record, null);
  
  const [showEmpMessage, setShowEmpMessage] = useState(false);
  const [showProjMessage, setShowProjMessage] = useState(false);

  type Assignment = {project_id: string; allocation_percentage: number;};

  const [assignments, setAssignments] = useState<Assignment[]>([{ project_id: "", allocation_percentage: 0 }, ]);
  const usedPercentage = assignments.reduce((sum, a) => sum + (a.allocation_percentage || 0), 0);
  const remainingPercentage = 100 - usedPercentage;
  const getAvailableProjects = (currentIndex: number) => {
  const selectedIds = assignments
    .map((a, i) => (i === currentIndex ? null : a.project_id))
    .filter(Boolean);

  return projectList.filter(
    (p) => !selectedIds.includes(p.id)
  );
  };


  useEffect(() => {
    if (empState?.success) {
      setShowEmpMessage(true);
      setAssignments([{ project_id: "", allocation_percentage: 0 }]);
      const timer = setTimeout(() => {
        setShowEmpMessage(false);
        router.refresh();
      }, 800);
      return () => clearTimeout(timer);
    }
    if (empState?.error) {
      setShowEmpMessage(true);
      const timer = setTimeout(() => setShowEmpMessage(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [empState, router]);

  useEffect(() => {
    if (projState?.success) {
      setShowProjMessage(true);

      const timer = setTimeout(() => {
        setShowProjMessage(false);
        router.refresh();
      }, 800);

      return () => clearTimeout(timer);
    }

    if (projState?.error) {
      setShowProjMessage(true);
      const timer = setTimeout(() => setShowProjMessage(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [projState, router]);


  return (
    <>
    <div className="flex flex-col items-start mb-[20px]">
      <form action={empFormAction} className="grid grid-cols-2 gap-[12px]">
        <input type="hidden" name="organization_id" value={orgId} />
        <div className="w-full flex flex-col">
          <label className="text-[#686868] font-medium mb-[5px] text-[15px]">name</label>
          <input name="system_name" type="text" placeholder="Enter full name" className="w-full border-[1px] border-[#b9b9b9] rounded-[10px] py-2 px-3 text-[15px] font-rethink focus:placeholder-transparent" required/>
        </div>

        <div className="w-full flex flex-col">
          <label className="text-[#686868] font-medium mb-[5px] text-[15px]">email</label>
          <input name="system_email" type="email" placeholder="Enter email address" className="w-full border-[1px] border-[#b9b9b9] rounded-[10px] py-2 px-3 text-[15px] font-rethink focus:placeholder-transparent" required/>
        </div>
        {empfields.map((field) => (
          <div key={field.id} className="w-full flex flex-col">
            <label htmlFor={field.id} className="text-[#686868] font-medium mb-[5px] text-[15px]">{field.label.toLowerCase()}</label>
            <input id={field.id} name={field.id} type={field.type ?? "text"} placeholder={`Enter ${field.label.toLowerCase()}`} className="w-full border-[1px] border-[#b9b9b9] rounded-[10px] py-2 px-3 text-[15px] font-rethink focus:placeholder-transparent"/>
          </div>
        ))}

        <div className="col-span-2">
          {projectList.length === 0 ? (
            <p className="text-red-500 font-medium mb-[10px] text-[15px]">
              No projects available. Please add a project first to assign to the employee.
            </p>
          ) : (
          <>
          <p className="text-black font-medium mb-[5px] text-[15px] border-b-[1px] border-[#b9b9b9] pb-[10px] mb-[20px]">
            Assign projects
          </p>
          {assignments.map((assignment, index) => (
            <div key={index} className="grid grid-cols-2 gap-[12px] mb-[10px] border-b-[1px] border-[#b9b9b9] pb-2">
              <label htmlFor={`assignments[${index}][project_id]`} className ="text-[#686868] font-medium text-[15px]">Project</label>
              <select
                name={`assignments[${index}][project_id]`}
                id={`assignments[${index}][project_id]`}
                value={assignment.project_id}
                onChange={(e) => {
                  const next = [...assignments];
                  next[index].project_id = e.target.value;
                  setAssignments(next);
                }}
                className="w-full border-[1px] border-[#b9b9b9] rounded-[10px] py-2 px-3 text-[15px] font-rethink focus:placeholder-transparent"
              >
                <option value="">None</option>
                {getAvailableProjects(index).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <label htmlFor={`assignments[${index}][allocation_percentage]`} className="text-[#686868] font-medium text-[15px]">Allocation Percentage (%)</label>
              <input
                type="number"
                min={1}
                id={`assignments[${index}][allocation_percentage]`}
                max={remainingPercentage + assignment.allocation_percentage}
                value={assignment.allocation_percentage || ""}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (usedPercentage - assignment.allocation_percentage + value > 100)
                    return;

                  const next = [...assignments];
                  next[index].allocation_percentage = value;
                  setAssignments(next);
                }}
                name={`assignments[${index}][allocation_percentage]`}
                placeholder="Allocation %"
                className="w-full border-[1px] border-[#b9b9b9] rounded-[10px] py-2 px-3 text-[15px] font-rethink focus:placeholder-transparent"
              />

              <label htmlFor={`assignments[${index}][start_date]`} className="text-[#686868] font-medium text-[15px]">Start Date</label>
              <input
                type="date"
                id={`assignments[${index}][start_date]`}
                name={`assignments[${index}][start_date]`}
                className="w-full border-[1px] border-[#b9b9b9] rounded-[10px] py-2 px-3 text-[15px] font-rethink focus:placeholder-transparent"
              />

              <label htmlFor={`assignments[${index}][end_date]`} className="text-[#686868] font-medium text-[15px]">End Date</label>
              <input
                type="date"
                id={`assignments[${index}][end_date]`}
                name={`assignments[${index}][end_date]`}
                className="w-full border-[1px] border-[#b9b9b9] rounded-[10px] py-2 px-3 text-[15px] font-rethink focus:placeholder-transparent"
              />
            </div>
          ))}
          <p className="text-[#686868] font-medium text-[15px] mb-[20px]">
            Remaining allocation: <b className="text-red-500">{remainingPercentage}%</b>
          </p>

          <button
            type="button"
            disabled={
              remainingPercentage <= 0 ||
              assignments.length >= projectList.length
            }
            onClick={() =>
              setAssignments([
                ...assignments,
                { project_id: "", allocation_percentage: 0 },
              ])
            }
            className="w-full bg-white text-black font-geist font-extrabold pl-[15px] pr-[10px] py-[5px] rounded-[15px]  border-dashed border-[2px] border-[#d2d2d2] flex flex-row items-center justify-center hover:translate-x-1 hover:duration-300 mb-[10px]"
          >
            + ADD PROJECT
          </button>
          </>
        )}
        </div>

        
        <div className="flex flex-col">
          {showEmpMessage && empState?.success && (
          <p className="text-green-500 text-[15px] font-bold font-rethink mb-2">Employee added</p>
          )}
          {showEmpMessage && empState?.error && (
            <p className="text-red-500 text-[15px] font-bold font-rethink mb-2">{empState.error}</p>
          )}
          <button disabled={isEmpPending} type="submit" className="w-auto bg-black text-white font-geist font-extrabold pl-[15px] pr-[10px] py-[5px] rounded-[15px] flex flex-row items-center justify-center shadow-md hover:translate-x-1 hover:duration-300 hover:bg-gray-800">
              <span>{isEmpPending ? "PROCESSING..." : "ADD EMPLOYEE"}</span>
              <Image src={arrowRight} alt="Arrow Right" width={22} height={22} className="ml-[5px]" />
          </button>
        </div>
      </form>
    </div>

    <div className="flex flex-col items-start mb-[20px]">
      <form action={projFormAction} className="grid grid-cols-2 gap-[12px]">
        <input type="hidden" name="organization_id" value={orgId} />
        <div className="w-full flex flex-col">
          <label className="text-[#686868] font-medium mb-[5px] text-[15px]">project name</label>
          <input name="project_name" type="text" placeholder="Enter project name" className="w-full border-[1px] border-[#b9b9b9] rounded-[10px] py-2 px-3 text-[15px] font-rethink focus:placeholder-transparent" required/>
        </div>
        {projfields.map((field) => (
          <div key={field.id} className="w-full flex flex-col">
            <label htmlFor={field.id} className="text-[#686868] font-medium mb-[5px] text-[15px]">{field.label.toLowerCase()}</label>
            <input id={field.id} name={field.id} type={field.type ?? "text"} placeholder={`Enter ${field.label.toLowerCase()}`} className="w-full border-[1px] border-[#b9b9b9] rounded-[10px] py-2 px-3 text-[15px] font-rethink focus:placeholder-transparent"/>
          </div>
        ))}
        <div className="flex flex-col">
          {showProjMessage && projState?.success && (
          <p className="text-green-500 text-[15px] font-bold font-rethink mb-2">Project added</p>
          )}
          {showProjMessage && projState?.error && (
            <p className="text-red-500 text-[15px] font-bold font-rethink mb-2">{projState.error}</p>
          )}
          <button type="submit" className="w-auto bg-black text-white font-geist font-extrabold pl-[15px] pr-[10px] py-[5px] rounded-[15px] flex flex-row items-center justify-center shadow-md hover:translate-x-1 hover:duration-300 hover:bg-gray-800">
              <span>{isProjPending ? "PROCESSING..." : "ADD PROJECT"}</span>
              <Image src={arrowRight} alt="Arrow Right" width={22} height={22} className="ml-[5px]" />
          </button>
        </div>
      </form>
    </div>
    </>
  );
}
