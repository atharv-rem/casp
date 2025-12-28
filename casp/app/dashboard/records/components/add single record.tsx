import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { addEmployeeRecord } from "@/app/dashboard/records/action";
import Image from "next/image";
import arrowRight from '@/public/assets/arrow icon.svg'

export default async function AddSingleRecord() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Not logged in</div>;

  const orgId = user.app_metadata?.organization_id;
  if (!orgId) return <div>No organization linked</div>;

  const { data: empSchema, error } = await supabaseAdmin
    .from("employee_schemas")
    .select("schema")
    .eq("organization_id", orgId)
    .single();

  if (error || !empSchema?.schema?.fields?.length) {
    return <p>No employee schema found.</p>;
  }

  const fields = empSchema.schema.fields;

  return (
    <div className="ml-[30px] mr-[30px] mt-[30px] flex flex-col items-start">
      <h2 className="text-[40px] font-rethink font-semibold">Add Employee</h2>

      <form action={addEmployeeRecord} className="mt-[20px] flex flex-col">
        <input type="hidden" name="organization_id" value={orgId} />
        <div className="w-full mb-[15px] flex flex-col">
          <label className="text-[#686868] font-bold mb-[5px]">Name</label>
          <input name="system_name" type="text" placeholder="Enter full name" className="w-full border-[1px] border-[#b9b9b9] rounded-[15px] px-[15px] py-[10px] text-[15px] font-rethink" required/>
        </div>

        <div className="w-full mb-[25px] flex flex-col">
          <label className="text-[#686868] font-bold mb-[5px]">Email</label>
          <input name="system_email" type="email" placeholder="Enter email address" className="w-full border-[1px] border-[#b9b9b9] rounded-[15px] px-[15px] py-[10px] text-[15px] font-rethink" required/>
        </div>
        {fields.map((field) => (
          <div key={field.id} className="w-full mb-[15px] flex flex-col">
            <label htmlFor={field.id} className="text-[#686868] font-bold mb-[5px]">{field.label}</label>
            <input id={field.id} name={field.id} type={field.type ?? "text"} placeholder={`Enter ${field.label}`} className="w-full border-[1px] border-[#b9b9b9] rounded-[15px] px-[15px] py-[10px] text-[15px] font-rethink"/>
          </div>
        ))}
        <button type="submit" className="w-auto bg-black text-white font-geist font-extrabold pl-[15px] pr-[10px] py-[5px] rounded-[15px] flex flex-row items-center justify-center shadow-md hover:translate-x-1 hover:duration-300 hover:bg-gray-800">
            <span>SUBMIT</span>
            <Image src={arrowRight} alt="Arrow Right" width={22} height={22} className="ml-[5px]" />
        </button>
      </form>
    </div>
  );
}
