import { cookies } from "next/headers";
import { getUserClient } from "@/lib/appwrite";
import Logout from "../components/logout_button";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const sessionSecret = cookieStore.get("session")?.value;

  if (!sessionSecret) return <div>Not logged in</div>;

  const { account } = getUserClient(sessionSecret);

  // This now works because sessionSecret is correct
  const user = await account.get();
  return (
    <div>
      <h1>Welcome, {user.name || user.email}</h1>
      <Logout />
    </div>
  );
}
