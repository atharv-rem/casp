import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {ChoosingRecords} from "@/app/dashboard/add_records/components/choosing record";

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

    const { data: projects, error } = await supabaseAdmin
        .from('projects')
        .select('id,name')
        .eq('organization_id', orgId);

    if (empError || !empSchema?.schema?.fields?.length) {
        return <p>No employee schema found.</p>;
    }

    const empfields = empSchema?.schema?.fields;
    const projfields = projSchema?.schema?.fields;
    const projectList = projects || [];
    return (
        <div className=" pl-[25px] pr-[30px] pt-[15px] w-full items-start justify-center flex flex-col">
            <ChoosingRecords orgId={orgId} empfields={empfields} projfields={projfields} projectList={projectList}/>
        </div>
    );
}