import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {z} from "zod";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required").regex(/^[a-zA-Z0-9]+( [a-zA-Z0-9]+)*$/, "Only letters, numbers, and single spaces are allowed").regex(/[a-zA-Z]/, "Name must contain at least one letter"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(10, "Password must be at least 10 characters").regex(/[A-Z]/, "Must contain at least one uppercase letter").regex(/[a-z]/, "Must contain at least one lowercase letter").regex(/[0-9]/, "Must contain at least one number").regex(/[#@$!%*?&]/, "Must contain at least one special character (@$!%*?&]"),
  organizationName: z.string().min(1, "Organization Name is required").regex(/^[a-zA-Z0-9]+( [a-zA-Z0-9]+)*$/, "Only letters, numbers, and single spaces are allowed").regex(/[a-zA-Z]/, "Name must contain at least one letter"),
});

export async function POST(req: Request) {
  const { email, password, name, organizationName } = await req.json();

  const validated_signup_data = signupSchema.safeParse({ email, password, name, organizationName });
  if (!validated_signup_data.success) {
    return NextResponse.json(
      { error: "Invalid signup data" },
      { status: 400 }
    );
  }

  try {

    // Create user in Supabase Auth
    const { data: createdUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: validated_signup_data.data.email,
        password : validated_signup_data.data.password,
        email_confirm: true,
        user_metadata: { name: validated_signup_data.data.name },
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
          name: validated_signup_data.data.organizationName,
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
        system_profile: {name: validated_signup_data.data.name, email: validated_signup_data.data.email},
        custom_profile: {}
      });

    if (employeeError) {//deletes the created user and organization if employee creation fails
      await supabaseAdmin.from("organizations").delete().eq("id", organization.id);
      await supabaseAdmin.auth.admin.deleteUser(createdUser.user.id);
      throw employeeError;
    }

    const { error: metadataError } =
      await supabaseAdmin.auth.admin.updateUserById(
        createdUser.user.id,
        {
          app_metadata: {
            organization_id: organization.id,
            organization_name: organization.name,
            onboarding_completed: false,
          },
        }
      );

    if (metadataError) {
      await supabaseAdmin.from("employees").delete().eq("auth_user_id", createdUser.user.id);
      await supabaseAdmin.from("organizations").delete().eq("id", organization.id);
      await supabaseAdmin.auth.admin.deleteUser(createdUser.user.id);
      throw metadataError;
    }

    const supabase = await createSupabaseServerClient();

    const { error: signinError } =
      await supabase.auth.signInWithPassword({ email: validated_signup_data.data.email, password: validated_signup_data.data.password });

    if (signinError) throw signinError;

    return NextResponse.json({ success: true });


  } 
  catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Signup failed" },
      { status: 400 }
    );
  }
}
