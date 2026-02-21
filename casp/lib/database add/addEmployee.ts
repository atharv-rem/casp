import { supabaseAdmin } from "@/lib/supabase/admin";

type system_profile = {
    "name": string;
    "email": string;
}

type custom_profile = {
    id: string;
    label: string;
    value: any;
}

export default async function add_employee(orgId: string, system_profile: system_profile, custom_profile: custom_profile[]) {
  const { data: employee, error} = await supabaseAdmin
      .from("employees")
      .insert({
        organization_id: orgId,
        role: "employee",
        status: "active",
        system_profile: system_profile,
        custom_profile: custom_profile,
        auth_user_id: null})
       .select("id")
       .single();
    
    if (error) {
        return { success: false, error: error.message };
    }
    return { success: true, employeeID: employee.id };
}