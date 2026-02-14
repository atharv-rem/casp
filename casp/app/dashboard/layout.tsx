import type { Metadata } from "next";
import "../globals.css";
import localFont from "next/font/local";
import PageRoute from "../global components/page_route";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Image from "next/image";
import ai from "@/public/assets/ai search.svg";
import gemini from "@/public/assets/gemini.svg"
import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "../global components/app_sidebar";
import getOrganizationNameByID from "@/lib/database/organization";
import getOrganizationID from "@/lib/database/organization_id";
import {cache} from 'react'

const kal = localFont({
  src: [
    { path: '../fonts/KalamaykaVF.woff2', style: 'normal' },
  ],
  variable: '--font-kal',
});


export const metadata: Metadata = {
  title: "Dashboard"
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) { 
  
  const {OrgId, AccountName} = await getOrganizationID();
  if (!OrgId || OrgId === "cannot find organization id")
     redirect("/login");
  const getCachedOrgName = cache(getOrganizationNameByID);
  const organizationName = await getCachedOrgName({ orgID: OrgId });

  return (
    <SidebarProvider className={`${kal.variable} flex flex-row items-center justify-center h-dvh w-full bg-white overflow-hidden`}>

      {/* LEFT SIDEBAR */}
      <div className="flex flex-col items-center justify-start h-full bg-[#fafafa]">
        <AppSidebar AccountName={AccountName} />
      </div>

      {/* MAIN MIDDLE CONTENT*/}
      <div className="flex flex-col items-start justify-start w-full h-full border-l-[1px] border-[#efefef] overflow-y-auto scrollbar-hide">
        <div className="flex flex-row justify-between items-center h-[30px] w-full p-2 sticky top-0 z-10 bg-white pl-[20px] pr-[30px] pt-[25px]">
          <PageRoute org={organizationName} />
        </div>
        {children}  
      </div>

      {/* RIGHT AI PANEL */}
      <div className="flex flex-col items-start justify-center min-w-[290px] max-w-[290px] h-full border-l-[1px] border-[#efefef]">
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

    </SidebarProvider>
  );
}


