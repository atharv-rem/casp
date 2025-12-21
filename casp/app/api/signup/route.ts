import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServerClient } from "@/lib/supabase/client";

export async function POST(req: Request) {
  const { email, password, name, organizationName } = await req.json();

  try {
    // Create user in Supabase Auth
    const { data: createdUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      });
    if (createError) throw createError;
    if (!createdUser.user) {
      throw new Error("Failed to create user");
    }

    // Create organization
    const { data: organization, error: orgError } =
      await supabaseAdmin
        .from("organizations")
        .insert({
          name: organizationName,
        })
        .select()
        .single();

    if (orgError) {//deletes the created user if organization creation fails
      await supabaseAdmin.auth.admin.deleteUser(createdUser.user.id);
      throw orgError;
    }

    if (!organization) {
      throw new Error("Failed to create organization");
    }

    //set this first user as admin of the organization
    const { error: employeeError } = await supabaseAdmin
      .from("employees")
      .insert({
        organization_id: organization.id,
        auth_user_id: createdUser.user.id,
        role: "admin",
        status: "active",
        profile: {
          name,
          email,
        },
      });

    if (employeeError) {//deletes the created user and organization if employee creation fails
      await supabaseAdmin .from("organizations").delete().eq("id", organization.id);
      await supabaseAdmin.auth.admin.deleteUser(createdUser.user.id);
      throw employeeError;
    }

    const { error: metadataError } =
      await supabaseAdmin.auth.admin.updateUserById(
        createdUser.user.id,
        {
          app_metadata: {
            organization_id: organization.id,
          },
        }
      );

    if (metadataError) {
      await supabaseAdmin.from("employees").delete().eq("auth_user_id", createdUser.user.id);
      await supabaseAdmin.from("organizations").delete().eq("id", organization.id);
      await supabaseAdmin.auth.admin.deleteUser(createdUser.user.id);
      throw metadataError;
    }


    const { data: sessionData, error: signinError } =
      await supabaseServerClient.auth.signInWithPassword({
        email,
        password,
      });

    if (signinError) throw signinError;
    if (!sessionData.session) {
      throw new Error("Unable to establish session");
    }

    const cookieStore = await cookies();

    cookieStore.set("sb-access-token", sessionData.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    cookieStore.set("sb-refresh-token", sessionData.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Signup failed" },
      { status: 400 }
    );
  }
}
