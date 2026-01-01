import type { Metadata } from "next";
import "../globals.css";
import localFont from "next/font/local";
import LogoutButton from "../global components/logout_button";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Image from "next/image";
import logo from "@/public/assets/black casp logo.png";
import usericon from "@/public/assets/user icon.svg";
import workplace from "@/public/assets/building.svg";
import sidebar from "@/public/assets/sidebar close.svg";
import database from "@/public/assets/database.svg";
import giveaccess from "@/public/assets/give access.svg";
import addrecord from "@/public/assets/add user.svg";
import ai from "@/public/assets/ai search.svg";
import gemini from "@/public/assets/gemini.svg"
import {Geist_Mono} from "next/font/google";
const kal = localFont({
  src: [
    { path: '../fonts/KalamaykaVF.woff2', style: 'normal' },
  ],
  variable: '--font-kal',
});
const geist = Geist_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dashboard"
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {  
  const supabase = await createSupabaseServerClient();
  const {data: { user }} = await supabase.auth.getUser();

  if (!user) {
    router.push('/login');
  }

  const AccountName = user.user_metadata?.name ?? "User";
  const orgId = user.app_metadata?.organization_id;

  if (!orgId) {
    return <div>No organization linked</div>;
  }

  const { data: org } = await supabaseAdmin
    .from("organizations")
    .select("name")
    .eq("id", orgId)
    .single();

  const OrganizationName = org?.name ?? "organization";


  return (
    <div className={`${kal.variable} ${geist.variable} flex flex-row items-center justify-center h-dvh w-full bg-white`}>

      {/* LEFT SIDEBAR */}
      <div className="flex flex-col items-center justify-start w-[20%] h-full">
        <div className="flex flex-row justify-between items-center h-[30px] w-full border-b-[1px] border-[#efefef] p-2">
          <div className="flex flex-row items-center justify-center"> 
            <Image src={usericon} alt="User Icon" width={14} height={14} className="mr-2"/>
            <p className="text-[14px] font-rethink font-bold text-black">{AccountName}</p>
          </div>
          <Image src={sidebar} alt="sidebar icon" width={15} height={15}/>
        </div>

        {/* Sidebar menu */}
        <div className="flex flex-col items-start justify-start w-full p-2 gap-0">
          <div className="flex flex-row items-center justify-start">
            <Image src={database} alt="database icon" width={14} height={14}/>
            <h1 className="text-[15px] font-rethink font-bold ml-[10px]">records</h1>
          </div>
          <div className="flex flex-row items-center justify-start">
            <Image src={addrecord} alt="add record" width={14} height={14}/>
            <Link href="/dashboard/records" className="text-[15px] font-rethink font-bold ml-[10px]">add records</Link>
          </div>
          <div className="flex flex-row items-center justify-start">
            <Image src={giveaccess} alt="give access" width={14} height={14}/>
            <h1 className="text-[15px] font-rethink font-bold ml-[10px]">give access</h1>
          </div>
        </div>
      </div>

      {/* MAIN MIDDLE CONTENT*/}
      <div className="flex flex-col items-center justify-start w-[70%] h-full border-l-[1px] border-[#efefef]">
        <div className="flex flex-row justify-between items-center h-[30px] w-full border-b-[1px] border-[#efefef] p-2">
          <div className="flex flex-row items-center justify-start gap-1">
            <Image src={workplace} alt="workplace Logo" width={14} height={14}/>
            <h1 className="text-[14px] font-rethink font-semibold">{OrganizationName.toLowerCase()}</h1>
            <p>/</p>
            <h1 className="text-[14px] font-rethink font-bold">dashboard</h1>
          </div>
          <LogoutButton />
        </div>
        {children}
      </div>

      {/* RIGHT AI PANEL */}
      <div className="flex flex-col items-start justify-center w-[30%] h-full border-l-[1px] border-[#efefef]">
        <h1 className="text-[30px] font-kal font-semibold leading-[30px] ml-[20px]">Chat with AI <br/> to get your tasks done</h1>
        <div className="flex flex-row">
          <p className="text-[15px] font-kal font-semibold ml-[20px]">powered by gemini</p>
          <Image src={gemini} alt="gemini logo" width={12} height={12} className="ml-[5px]"/>
        </div>

        <div className="fixed bottom-[20px] right-[10px] flex flex-row items-center justify-start shadow-md hover:shadow-lg w-[250px] px-[10px] py-[5px] rounded-[12px] border-[1px] border-[#efefef] cursor-pointer">
          <Image src={ai} alt="AI icon" width={18} height={18}/>
          <p className="text-[15px] ml-[5px] font-albert font-bold">what would you like me do?</p>
        </div>
      </div>

    </div>
  );
}


