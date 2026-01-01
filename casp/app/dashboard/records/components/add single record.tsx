import { add_single_employee_record } from "@/app/dashboard/records/action";
import { add_single_project_record } from "@/app/dashboard/records/action";
import Image from "next/image";
import arrowRight from '@/public/assets/arrow icon.svg'
import { useActionState, useEffect, useState } from "react";

interface Field {
  id: string;
  label: string;
  type?: string;
}

export default function AddSingleRecord({ orgId, empfields, projfields }: { orgId: string; empfields: Field[]; projfields: Field[] }) {
  const [empState, empFormAction, isEmpPending] = useActionState(add_single_employee_record, null);
  const [projState, projFormAction, isProjPending] = useActionState(add_single_project_record, null);
  
  const [showEmpMessage, setShowEmpMessage] = useState(false);
  const [showProjMessage, setShowProjMessage] = useState(false);

  useEffect(() => {
    if (empState?.success || empState?.error) {
      setShowEmpMessage(true);
      const timer = setTimeout(() => setShowEmpMessage(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [empState]);

  useEffect(() => {
    if (projState?.success || projState?.error) {
      setShowProjMessage(true);
      const timer = setTimeout(() => setShowProjMessage(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [projState]);

  return (
    <>
    <div className="flex flex-col items-start mb-[20px]">
      <form action={empFormAction} className="grid grid-cols-2 gap-[12px]">
        <input type="hidden" name="organization_id" value={orgId} />
        <div className="w-full flex flex-col">
          <label className="text-[#686868] font-medium mb-[5px]">name</label>
          <input name="system_name" type="text" placeholder="Enter full name" className="w-full border-[1px] border-[#b9b9b9] rounded-[10px] py-2 px-3 text-[15px] font-rethink focus:placeholder-transparent" required/>
        </div>

        <div className="w-full flex flex-col">
          <label className="text-[#686868] font-medium mb-[5px]">email</label>
          <input name="system_email" type="email" placeholder="Enter email address" className="w-full border-[1px] border-[#b9b9b9] rounded-[10px] py-2 px-3 text-[15px] font-rethink focus:placeholder-transparent" required/>
        </div>
        {empfields.map((field) => (
          <div key={field.id} className="w-full flex flex-col">
            <label htmlFor={field.id} className="text-[#686868] font-medium mb-[5px]">{field.label.toLowerCase()}</label>
            <input id={field.id} name={field.id} type={field.type ?? "text"} placeholder={`Enter ${field.label.toLowerCase()}`} className="w-full border-[1px] border-[#b9b9b9] rounded-[10px] py-2 px-3 text-[15px] font-rethink focus:placeholder-transparent"/>
          </div>
        ))}
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

    <div className="flex flex-col items-start">
      <form action={projFormAction} className="grid grid-cols-2 gap-[12px]">
        <input type="hidden" name="organization_id" value={orgId} />
        <div className="w-full flex flex-col">
          <label className="text-[#686868] font-medium mb-[5px]">project name</label>
          <input name="project_name" type="text" placeholder="Enter project name" className="w-full border-[1px] border-[#b9b9b9] rounded-[10px] py-2 px-3 text-[15px] font-rethink focus:placeholder-transparent" required/>
        </div>
        {projfields.map((field) => (
          <div key={field.id} className="w-full flex flex-col">
            <label htmlFor={field.id} className="text-[#686868] font-medium mb-[5px]">{field.label.toLowerCase()}</label>
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
