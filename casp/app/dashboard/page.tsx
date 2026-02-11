import WelcomeMessage from "../global components/welcome_message";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col items-center justify-start">
      <WelcomeMessage user={user} />
    </div>
  );
}
