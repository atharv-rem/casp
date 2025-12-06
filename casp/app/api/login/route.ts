import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminClient } from "@/lib/appwrite";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const account = getAdminClient();

  try {
    // Create session
    const session = await account.createEmailPasswordSession({
      email,
      password,
    });

    // IMPORTANT: use session.secret, NOT session.$id
    const sessionSecret = session.secret;

    // Store it in cookie
    const cookieStore = await cookies();
    cookieStore.set("session", sessionSecret, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }
}
