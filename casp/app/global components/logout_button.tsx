"use client";
import { useRouter } from "next/navigation";
import logout_icon from "@/public/assets/logout.svg";
import Image from "next/image";
export default function LogoutButton() {
  const router = useRouter();
  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
    });
    router.push("/");
  };

  return (
    <div onClick={handleLogout} className="flex flex-row items-center justify-center text-[13px] bg-white hover:bg-gray-200 text-black font-rethink font-bold px-[10px] rounded-[8px] border-[1px] border-[#c5c5c5] shadow-xs">
      <Image src={logout_icon} alt="Logout Icon" className="inline-block w-[12px] h-[12px] mr-2" />
      <span>Logout</span>
    </div>
  );
}
