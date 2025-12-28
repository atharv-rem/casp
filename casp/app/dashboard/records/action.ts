"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function addEmployeeRecord(formData: FormData) {
  const organization_id = formData.get("organization_id") as string;

  const system_profile: Record<string, any> = {};
  const custom_profile: Record<string, any> = {};

  for (const [key, value] of formData.entries()) {
  if (key === "organization_id" || key.startsWith("$ACTION_ID_")) {
    continue;
  }
  if (key.startsWith("system_")) {
    system_profile[key.replace("system_", "")] = value;
  } else {
    custom_profile[key] = value;
  }
}


  const { error } = await supabaseAdmin
    .from("employees")
    .insert({
      organization_id,
      role: "employee",
      status: "active",
      system_profile,
      custom_profile,
      auth_user_id: null
    });

  if (error) {
    console.error(error);
    throw new Error("Failed to create employee");
  }
}
