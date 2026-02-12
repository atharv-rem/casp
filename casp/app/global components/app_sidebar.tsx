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
import { useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Dashboard,
  },
  {
    title: "Records",
    url: "/dashboard/records",
    icon: database,
  },
  {
    title: "Add Records",
    url: "/dashboard/add_records",
    icon: addrecord,
  },
  {
    title: "Give Access",
    url: "#",
    icon: giveaccess,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: settings,
  },
]

export function AppSidebar({AccountName}: {AccountName: string}) {

  const router = useRouter();
  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
    });
    router.push("/");
  };
  return (
    <Sidebar variant="sidebar" collapsible="icon" className="p-2">
      <SidebarHeader className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center justify-start">
          <Image src={user} alt="User Icon" width={15} height={15} className="ml-[2px] mr-[8px] group-data-[state=collapsed]:size-5! shrink-0" />
          <span className="text-[15px] font-rethink font-semibold group-data-[state=collapsed]:hidden">{AccountName.split(" ")[0]}</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
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
            </SidebarMenuItem>
          ))}
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