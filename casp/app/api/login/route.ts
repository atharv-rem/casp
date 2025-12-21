import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServerClient } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  //Validate inputs
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  //Authenticate user
  const { data, error } =
    await supabaseServerClient.auth.signInWithPassword({
      email,
      password,
    });

  if (error || !data || !data.user || !data.session) {
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

  //Check employee record
  const { data: employee, error: employeeError } =
    await supabaseAdmin
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

  const cookieStore = await cookies();
  cookieStore.set("sb-access-token", data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  cookieStore.set("sb-refresh-token", data.session.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return NextResponse.json({ success: true });
}
