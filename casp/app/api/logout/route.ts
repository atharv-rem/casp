import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Account } from "appwrite";

export async function POST() {
  const cookieStore = await cookies();
  const sessionSecret = cookieStore.get("session")?.value;

  if (!sessionSecret) {
    return NextResponse.json({ error: "No active session" }, { status: 401 });
  }

  // Create user-authenticated client (NOT admin client)
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setSession(sessionSecret); // <-- important

  const account = new Account(client);

  try {
    await account.deleteSession("current");

    // Remove the cookie
    cookieStore.delete("session");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
