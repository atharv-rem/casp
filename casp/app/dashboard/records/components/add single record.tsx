import { add_single_employee_record } from "@/app/dashboard/records/action";
import { add_single_project_record } from "@/app/dashboard/records/action";
import Image from "next/image";
import arrowRight from '@/public/assets/arrow icon.svg'

interface Field {
  id: string;
  label: string;
  type?: string;
}

export default function AddSingleRecord({ orgId, empfields, projfields }: { orgId: string; empfields: Field[]; projfields: Field[] }) {
  return (
    <>
    <div className="flex flex-col items-start mb-[20px]">
      <form action={add_single_employee_record} className="grid grid-cols-2 gap-[12px]">
        <input type="hidden" name="organization_id" value={orgId} />
        <div className="w-full flex flex-col">
          <label className="text-[#686868] font-medium mb-[5px]">name</label>
          <input name="system_name" type="text" placeholder="Enter full name" className="w-full border-[1px] border-[#b9b9b9] rounded-[10px] py-2 px-3 text-[15px] font-rethink" required/>
        </div>

        <div className="w-full flex flex-col">
          <label className="text-[#686868] font-medium mb-[5px]">email</label>
          <input name="system_email" type="email" placeholder="Enter email address" className="w-full border-[1px] border-[#b9b9b9] rounded-[10px] py-2 px-3 text-[15px] font-rethink" required/>
        </div>
        {empfields.map((field) => (
          <div key={field.id} className="w-full flex flex-col">
            <label htmlFor={field.id} className="text-[#686868] font-medium mb-[5px]">{field.label.toLowerCase()}</label>
            <input id={field.id} name={field.id} type={field.type ?? "text"} placeholder={`Enter ${field.label.toLowerCase()}`} className="w-full border-[1px] border-[#b9b9b9] rounded-[10px] py-2 px-3 text-[15px] font-rethink"/>
          </div>
        ))}
        <button type="submit" className="w-[200px] bg-black text-white font-geist font-extrabold pl-[15px] pr-[10px] py-[5px] rounded-[15px] flex flex-row items-center justify-center shadow-md hover:translate-x-1 hover:duration-300 hover:bg-gray-800">
            <span>ADD EMPLOYEE</span>
            <Image src={arrowRight} alt="Arrow Right" width={22} height={22} className="ml-[5px]" />
        </button>
      </form>
    </div>

    <div className="flex flex-col items-start">
      <form action={add_single_project_record} className="grid grid-cols-2 gap-[12px]">
        <input type="hidden" name="organization_id" value={orgId} />
        <div className="w-full flex flex-col">
          <label className="text-[#686868] font-medium mb-[5px]">project name</label>
          <input name="project_name" type="text" placeholder="Enter project name" className="w-full border-[1px] border-[#b9b9b9] rounded-[10px] py-2 px-3 text-[15px] font-rethink" required/>
        </div>
        {projfields.map((field) => (
          <div key={field.id} className="w-full flex flex-col">
            <label htmlFor={field.id} className="text-[#686868] font-medium mb-[5px]">{field.label.toLowerCase()}</label>
            <input id={field.id} name={field.id} type={field.type ?? "text"} placeholder={`Enter ${field.label.toLowerCase()}`} className="w-full border-[1px] border-[#b9b9b9] rounded-[10px] py-2 px-3 text-[15px] font-rethink"/>
          </div>
        ))}
        <button type="submit" className="w-[200px] bg-black text-white font-geist font-extrabold pl-[15px] pr-[10px] py-[5px] rounded-[15px] flex flex-row items-center justify-center shadow-md hover:translate-x-1 hover:duration-300 hover:bg-gray-800">
            <span>ADD PROJECT</span>
            <Image src={arrowRight} alt="Arrow Right" width={22} height={22} className="ml-[5px]" />
        </button>
      </form>
    </div>
    </>
  );
}
