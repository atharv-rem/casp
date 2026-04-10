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
import Employee from "@/public/assets/employee.svg"
import cube from "@/public/assets/cube.svg"
import { usePathname, useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,

} from "@/components/ui/tooltip"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type SidebarItem = {
  title: string;
  url: string;
  icon: ComponentProps<typeof Image>["src"];
  tooltipContent: string;
};

type SidebarMenuGroup = {
  title: string;
  items: SidebarItem[];
};

type SidebarEntry = SidebarItem | SidebarMenuGroup;

const isSidebarMenuGroup = (entry: SidebarEntry): entry is SidebarMenuGroup => {
  return "items" in entry;
};

const menuEntries: SidebarEntry[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Dashboard,
    tooltipContent: "overview of your account, including recent activity, statistics, and important notifications"
  },
  {
    title: "Manage Records",
    items: [
      {
        title: "Employees",
        url: "/dashboard/employees",
        icon: Employee,
        tooltipContent: "view and manage all the employees associated with your account"
      },
      {
        title: "Projects",
        url: "/dashboard/projects",
        icon: cube,
        tooltipContent: "view and manage all the projects associated with your account"
      },
    ]
  },
  {
    title: "Add Records",
    url: "/dashboard/add_records",
    icon: addrecord,
    tooltipContent: "add new records to your account either manually or by importing data from excel"
  },
  {
    title: "Give Access",
    url: "#",
    icon: giveaccess,
    tooltipContent: "grant access to other users for your account"
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: settings,
    tooltipContent: "customize your account preferences and manage account settings."
  },
]

export function AppSidebar({AccountName}: {AccountName: string}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
    });
    router.push("/");
  };

  const sidebarmenuitem = (item: SidebarItem) => {
    const isActive = pathname === item.url;

    return (
      <SidebarMenuItem key={item.title}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuButton asChild isActive={isActive} className={`transition-all duration-200 ${isActive ? "bg-white text-black border-[2px] border-[#e5e7eb]" : "text-black hover:text-gray-900"}`}>
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
                <span className="leading-[12px] text-gray-600">{item.tooltipContent}</span>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SidebarMenuItem>
    )
  }

  function SidebarMenuGroupItem({group,pathname,}: {  group: SidebarMenuGroup; pathname: string;}) {
    const isChildActive = group.items.some((item) => pathname === item.url);
    const [isOpen, setIsOpen] = useState(isChildActive);

    return (
      <SidebarMenu>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                isActive={isChildActive}
                className={`transition-all duration-200 ${
                  isChildActive
                    ? "bg-white text-black border-[2px] border-[#e5e7eb]"
                    : "text-black hover:text-gray-900"
                }`}
              >
                <Image
                  src={database}
                  alt={`${group.title} icon`}
                  width={18}
                  height={18}
                  className="shrink-0 group-data-[collapsible=icon]:size-5!"
                />
                <span className="font-rethink text-[14px] font-semibold group-data-[collapsible=icon]:hidden">
                  {group.title}
                </span>
                <ChevronDown
                  className={`ml-auto size-4 transition-transform group-data-[collapsible=icon]:hidden ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>

            <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
              <SidebarMenuSub className="mt-1 ml-6 border-l border-[#c6c6c6] pl-2 gap-2">
                {group.items.map((item) => {
                  const isActive = pathname === item.url;

                  return (
                    <SidebarMenuSubItem key={item.title}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isActive}
                        className={`px-[5px] py-[10px] font-rethink text-[14px] font-semibold ${
                          isActive
                            ? "bg-white text-black border-[2px] border-[#e5e7eb]"
                            : "text-black hover:text-gray-900"
                        }`}
                      >
                        <Link href={item.url}>
                          <Image
                            src={item.icon}
                            alt={`${item.title} icon`}
                            width={18}
                            height={18}
                            className="shrink-0"
                          />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  );
                })}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    );
  }


  const rendersidebarentry = (entry: SidebarEntry) => {
    if (isSidebarMenuGroup(entry)) {
      return (
        <SidebarMenuGroupItem
          key={entry.title}
          group={entry}
          pathname={pathname}
        />
      );
    }

    return (
      <SidebarMenu key={entry.title}>
        {sidebarmenuitem(entry)}
      </SidebarMenu>
    );
  };


  return (
    <Sidebar variant="sidebar" collapsible="icon" className="p-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarHeader className="flex flex-row justify-between items-center bg-white border-[1px] border-[#e5e7eb] rounded-md py-[2px] group-data-[state=collapsed]:py-[5px] mb-[10px]">
              <div className="flex flex-row items-center justify-start">
                <Image src={user} alt="User Icon" width={15} height={15} loading="eager" className="ml-[2px] mr-[8px] group-data-[state=collapsed]:size-4! shrink-0" />
                <span className="text-[15px] font-rethink font-semibold group-data-[state=collapsed]:hidden">{AccountName.split(" ")[0]}</span>
              </div>
            </SidebarHeader>
          </TooltipTrigger>
          <TooltipContent side="right" align="center" sideOffset={15} className="font-rethink mt-[5px] bg-white text-[12px] font-semibold text-black w-[200px] h-auto shadow-lg border-[2px] border-[#e5e7eb] animate-in fade-in zoom-in duration-200 p-[10px]">
            <div className="flex flex-col">
              <span className="text-[14px] leading-[10px] font-bold mb-[5px]">Account</span>
              <span className="leading-[15px] text-gray-600">your logged in as <b>{AccountName}</b></span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <SidebarContent>
        {menuEntries.map(rendersidebarentry)}
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