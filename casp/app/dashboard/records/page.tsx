import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {ChoosingRecords} from "@/app/dashboard/records/components/choosing record.tsx";

export default async function RecordsPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <div>Not logged in</div>;

    const orgId = user.app_metadata?.organization_id;
    if (!orgId) return <div>No organization linked</div>;

    const { data: empSchema, empError } = await supabaseAdmin
        .from("employee_schemas")
        .select("schema")
        .eq("organization_id", orgId)
        .single();
    
    const {data: projSchema, error: projError } = await supabaseAdmin
        .from("project_schemas")
        .select("schema")
        .eq("organization_id", orgId)
        .single();

    if (empError || !empSchema?.schema?.fields?.length) {
        return <p>No employee schema found.</p>;
    }

    const empfields = empSchema?.schema?.fields;
    const projfields = projSchema?.schema?.fields ;
    return (
        <div className=" pl-[30px] pr-[30px] w-full items-start justify-center flex flex-col">
            <h1 className="mt-[15px] text-[40px] font-rethink font-semibold">Add Records</h1>
            <p className="mr-[30px] mb-[10px] text-[18px] font-rethink font-medium text-gray-600">Choose how you want to add records</p>
            <ChoosingRecords orgId={orgId} empfields={empfields} projfields={projfields} />
        </div>
    );
}