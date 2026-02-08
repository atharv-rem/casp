import database from "@/public/assets/database.svg";
import giveaccess from "@/public/assets/give access.svg";
import addrecord from "@/public/assets/add user.svg";
import settings from "@/public/assets/settings.svg"
import user from "@/public/assets/user icon.svg"
import Image from "next/image";
import Link from "next/link";
import Logout_Button from "./logout_button";

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
  SidebarTrigger
} from "@/components/ui/sidebar"

const items = [
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
  return (
    <Sidebar variant="sidebar" collapsible="icon" className="p-2">
      <SidebarHeader className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center justify-start">
          <Image src={user} alt="User Icon" width={14} height={14} className="mr-2" />
          <span className="text-[14px] font-rethink font-semibold">{AccountName.split(" ")[0]}</span>
        </div>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="p-2">
          {items.map((item) => (
            <Link href={item.url} key={item.title}>
              <SidebarMenuItem>
                <div className="flex flex-row items-center justify-start">
                  <Image src={item.icon} alt={`${item.title} icon`} width={14} height={14} className="mr-2" />
                  <span className="font-rethink text-[13px] font-semibold hover:text-gray-800">{item.title}</span>
                </div>
              </SidebarMenuItem>
            </Link>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="px-[10px]">
        <Logout_Button />
      </SidebarFooter>
    </Sidebar>
  )
}