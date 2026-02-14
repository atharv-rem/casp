'use client'
import database from "@/public/assets/database.svg";
import giveaccess from "@/public/assets/give access.svg";
import addrecord from "@/public/assets/add user.svg";
import settings from "@/public/assets/settings.svg"
import user from "@/public/assets/user icon.svg"
import Image from "next/image";
import Link from "next/link";
import logout_icon from "@/public/assets/logout.svg";
import Dashboard from "@/public/assets/dashboard.svg"
import { usePathname, useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Dashboard,
    TooltipContent: "overview of your account, including recent activity, statistics, and important notifications"
  },
  {
    title: "Records",
    url: "/dashboard/records",
    icon: database,
    TooltipContent: "view and manage all the records associated with your account"
  },
  {
    title: "Add Records",
    url: "/dashboard/add_records",
    icon: addrecord,
    TooltipContent: "add new records to your account either manually or by importing data from excel"
  },
  {
    title: "Give Access",
    url: "#",
    icon: giveaccess,
    TooltipContent: "grant access to other users for your account"
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: settings,
    TooltipContent: "customize your account preferences and manage account settings."
  },
]

export function AppSidebar({AccountName}: {AccountName: string}) {
  const pathsname = usePathname();
  const router = useRouter();
  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
    });
    router.push("/");
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="p-2">
      <SidebarHeader className="flex flex-row justify-between items-center bg-white border-[1px]  shadow-sm border-[#e5e7eb] rounded-md py-[2px] group-data-[state=collapsed]:py-[5px] mb-[10px]">
        <div className="flex flex-row items-center justify-start">
          <Image src={user} alt="User Icon" width={15} height={15} className="ml-[2px] mr-[8px] group-data-[state=collapsed]:size-4! shrink-0" />
          <span className="text-[15px] font-rethink font-semibold group-data-[state=collapsed]:hidden">{AccountName.split(" ")[0]}</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathsname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild isActive={isActive} className={`transition-all duration-200 ${isActive ? "bg-white text-black border-[2px] border-[#e5e7eb]" : "text-gray-600 hover:bg-gray-200/50"}`}>
                      <Link href={item.url} className="flex items-center gap-2">
                        <Image
                          src={item.icon}
                          alt={`${item.title} icon`}
                          width={18}
                          height={18}
                          className="shrink-0 group-data-[collapsible=icon]:size-5!"
                        />
                        <span className="font-rethink text-[14px] font-semibold">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center" sideOffset={15} className="font-rethink bg-white text-[12px] font-semibold text-black w-[200px] h-auto shadow-lg border-[2px] border-[#e5e7eb] animate-in fade-in zoom-in duration-200 p-[10px]">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold leading-[10px] mb-[5px]">{item.title}</span>
                      <span className="leading-[12px] text-gray-600">{item.TooltipContent}</span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="px-[10px]">
        <div onClick={handleLogout} className="flex flex-row items-center justify-center text-[15px] w-auto hover:bg-gray-200 text-black font-rethink font-bold py-[2px] bg-[#ffffff] rounded-md cursor-pointer group-data-[state=collapsed]:bg-none border border-gray-300 group-data-[state=collapsed]:border-0">
          <Image src={logout_icon} alt="Logout Icon" className="w-[12px] h-[12px] mr-2 group-data-[state=collapsed]:size-5!" />
          <span className="group-data-[state=collapsed]:hidden">Logout</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}