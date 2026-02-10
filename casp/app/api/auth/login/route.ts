import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { email, password } = await req.json();
  try {

    const validate_login_data = loginSchema.safeParse({ email, password });
    if (!validate_login_data.success) {
      return NextResponse.json(
        { message: "invalid data"},
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: validate_login_data.data.email,
        password: validate_login_data.data.password,
      });

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message ?? "Invalid login credentials" },
        { status: 401 }
      );
    }

    const organizationId = data.user.app_metadata?.organization_id;

    if (!organizationId) {
      return NextResponse.json(
        { error: "User is not associated with any organization" },
        { status: 403 }
      );
    }

    const { data: employee, error: employeeError } = await supabaseAdmin
        .from("employees")
        .select("status")
        .eq("auth_user_id", data.user.id)
        .single();

    if (employeeError || !employee) {
      return NextResponse.json(
        { error: "Employee record not found" },
        { status: 403 }
      );
    }

    if (employee.status !== "active") {
      return NextResponse.json(
        { error: "Account is disabled" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, organizationId });
    } 
  catch (error: any) {
    return NextResponse.json(
      { error: error.message || "login failed" },
      { status: 500 }
    );
  }
}
