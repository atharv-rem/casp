import { supabaseAdmin } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AddSingleRecord() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Not logged in</div>;

  const orgId = user.app_metadata?.organization_id;
  if (!orgId) return <div>No organization linked</div>;

  const { data:emp_schema, error } = await supabaseAdmin
    .from("employee_schemas")
    .select("schema")
    .eq("organization_id", orgId)
    .single(); 

  if (error || !emp_schema?.schema?.fields?.length) {
    return <p>No employee schema found.</p>;
  }
  const fields = emp_schema.schema.fields;

  return (
    <div className="ml-[30px] mr-[30px] mt-[30px] flex flex-col items-start">
      <h2 className="text-[40px] font-rethink font-semibold">Add Records</h2>

      <form className="w-full mt-[20px] flex flex-col">
        {fields.map((emp_schema) => (
          <div key={emp_schema.id} className="w-full mb-[15px] flex flex-col font-rethink">
            <label className="text-[#686868] font-bold mb-[5px]" htmlFor={emp_schema.id}>
              {emp_schema.label}
            </label>

            <input
              type="text"
              name={emp_schema.id}
              placeholder={`Enter ${emp_schema.label}`}
              className="w-full border-[2px] border-[#e8e8e8] rounded-[15px] px-[15px] py-[10px]"
            />
          </div>
        ))}
      </form>
    </div>
  );
}
