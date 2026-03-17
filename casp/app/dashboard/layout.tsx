import type { Metadata } from "next";
import "../globals.css";
import localFont from "next/font/local";
import PageRoute from "../global components/page_route";
import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "../global components/app_sidebar";
import getOrganizationNameByID from "@/lib/database fetch/organization";
import getOrganizationID from "@/lib/database fetch/organization_id";
import {cache} from 'react'
import { RightAiPanel } from "./components/right-ai-panel"

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
        <div className="flex flex-row justify-between items-center h-[30px] w-full p-2 sticky top-0 z-10 bg-white pl-[20px] pr-[20px] pt-[25px]">
          <PageRoute org={organizationName} />
        </div>
        {children}  
      </div>

      {/* RIGHT AI PANEL */}
      <RightAiPanel />

    </SidebarProvider>
  );
}


