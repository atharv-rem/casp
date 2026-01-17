import database from "@/public/assets/database.svg";
import giveaccess from "@/public/assets/give access.svg";
import addrecord from "@/public/assets/add user.svg";
import settings from "@/public/assets/settings.svg"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  {
    title: "records",
    url: "/dashboard/records",
    icon: database,
  },
  {
    title: "add records",
    url: "/dashboard/add_records",
    icon: addrecord,
  },
  {
    title: "give access",
    url: "#",
    icon: giveaccess,
  },
  {
    title: "settings",
    url: "/dashboard/settings",
    icon: settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent />
    </Sidebar>
  )
}