"use client";
import { useRouter } from "next/navigation";
export default function LogoutButton() {
  const router = useRouter();
  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
    });
    router.push("/");
  };

  return (
    <button onClick={handleLogout} className="text-[13px] bg-black hover:bg-gray-800 text-white font-rethink font-bold px-[10px] rounded-[8px]">
      logout
    </button>
  );
}
