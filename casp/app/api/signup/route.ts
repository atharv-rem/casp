import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ID } from "node-appwrite";
import { getAdminClient } from "@/lib/appwrite";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();
  const account = getAdminClient();

  try {
    await account.create({
      userId: ID.unique(),
      email,
      password,
      name,
    });

    const session = await account.createEmailPasswordSession({
      email,
      password,
    });

    const cookieStore = await cookies();

    // STORE THE SESSION SECRET, NOT THE ID
    cookieStore.set("session", session.secret, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { error: error.message ?? "Signup failed" },
      { status: 400 }
    );
  }
}
