import type { Metadata } from "next";
import "../globals.css";
import localFont from "next/font/local";
import LogoutButton from "../components/logout_button";
import Link from "next/link";
const kal = localFont({
  src: [
    { path: '../fonts/KalamaykaVF.woff2', style: 'normal' },
  ],
  variable: '--font-kal',
});

export const metadata: Metadata = {
  title: "Dashboard"
};
import { cookies } from "next/headers";
import { getUserClient } from "@/lib/appwrite";
import Image from "next/image";

import logo from "@/public/assets/black casp logo.png";
import usericon from "@/public/assets/user icon.svg";
import workplace from "@/public/assets/building.svg";
import sidebar from "@/public/assets/sidebar close.svg";
import database from "@/public/assets/database.svg";
import giveaccess from "@/public/assets/give access.svg";
import addrecord from "@/public/assets/add user.svg";
import ai from "@/public/assets/ai search.svg";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionSecret = cookieStore.get("session")?.value;

  if (!sessionSecret) return <div>Not logged in</div>;

  const { account } = getUserClient(sessionSecret);
  const user = await account.get();

  return (
    <div className={`${kal.variable} flex flex-row items-center justify-center h-dvh w-full bg-white`}>

      {/* LEFT SIDEBAR */}
      <div className="flex flex-col items-center justify-start w-[20%] h-full">
        <div className="flex flex-row justify-between items-center h-[30px] w-full border-b-[1px] border-[#efefef] p-2">
          <div className="flex flex-row items-center justify-start gap-1">
            <Image src={logo} alt="CASP Logo" width={15} height={15}/>
            <h1 className="text-[15px] font-cal">casp</h1>
          </div>
          <Image src={sidebar} alt="sidebar icon" width={15} height={15}/>
        </div>

        {/* Sidebar menu */}
        <div className="flex flex-col items-start justify-start w-full p-2 gap-1">
          <div className="flex flex-row items-center justify-start">
            <Image src={database} alt="database icon" width={16} height={16}/>
            <h1 className="text-[15px] font-albert font-semibold ml-[10px]">records</h1>
          </div>
          <div className="flex flex-row items-center justify-start">
            <Image src={addrecord} alt="add record" width={16} height={16}/>
            <Link href="/dashboard/records" className="text-[15px] font-albert font-semibold ml-[10px]">add records</Link>
          </div>
          <div className="flex flex-row items-center justify-start">
            <Image src={giveaccess} alt="give access" width={16} height={16}/>
            <h1 className="text-[15px] font-albert font-semibold ml-[10px]">give access</h1>
          </div>
        </div>

        {/* User bottom left */}
        <div className="fixed bottom-[20px] left-[20px] flex flex-row items-center justify-start"> 
          <Image src={usericon} alt="User Icon" width={15} height={15} className="mb-2"/>
          <p className="text-[13px] font-inter text-gray-400">{user.name}</p>
        </div>
      </div>

      {/* MAIN MIDDLE CONTENT*/}
      <div className="flex flex-col items-center justify-start w-[70%] h-full border-l-[1px] border-[#efefef]">
        <div className="flex flex-row justify-between items-center h-[30px] w-full border-b-[1px] border-[#efefef] p-2">
          <div className="flex flex-row items-center justify-start gap-1">
            <Image src={workplace} alt="CASP Logo" width={15} height={15}/>
            <h1 className="text-[14px] font-albert font-semibold ml-2">{user.name}</h1>
            <p>/</p>
            <h1 className="text-[14px] font-albert font-bold">dashboard</h1>
          </div>
          <LogoutButton />
        </div>
        {children}
      </div>

      {/* RIGHT AI PANEL */}
      <div className="flex flex-col items-start justify-center w-[30%] h-full border-l-[1px] border-[#efefef]">
        <h1 style={{textShadow: ' 0 122px 34px rgba(143, 143, 143, 0.00), 0 78px 31px rgba(143, 143, 143, 0.01), 0 44px 26px rgba(143, 143, 143, 0.05), 0 20px 20px rgba(143, 143, 143, 0.09), 0 5px 11px rgba(143, 143, 143, 0.10)'}} className="text-[30px] font-kal font-semibold leading-[30px] ml-[20px]">Chat with AI <br/> to get your tasks done</h1>
        <p className="text--[10px] font-kal font-semibold ml-[20px]">powered by gemini</p>

        <div className="fixed bottom-[20px] right-[10px] flex flex-row items-center justify-start shadow-md hover:shadow-lg w-[250px] px-[10px] py-[5px] rounded-[12px] border-[1px] border-[#efefef] cursor-pointer">
          <Image src={ai} alt="AI icon" width={18} height={18}/>
          <p className="text-[15px] ml-[5px] font-albert font-bold">what would you like me do?</p>
        </div>
      </div>

    </div>
  );
}


