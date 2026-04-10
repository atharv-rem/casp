"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import ai from "@/public/assets/gemini.svg";
import { useAiPanelStore } from "@/zustand-global-storage";

export default function PageRoute({ org }: { org: string }) {
    const pathname = usePathname();
    const isOpen = useAiPanelStore((state) => state.isAiPanelOpen);
    const toggle = useAiPanelStore((state) => state.toggleAiPanel);
    let pathSegments = pathname.split("/").filter(Boolean).map(segment => segment.replace(/_/g, " ")).join(" / ");
    if (pathname.startsWith("/dashboard/employees/")) {
        pathSegments = "dashboard / employee details"
    }
    if (pathname === "/dashboard/projects") {
        pathSegments = "dashboard / project details"
    }
    console.log("pathname:", pathname, "pathSegments:", pathSegments);
    return (
        <div className="flex flex-row items-center justify-between w-full">
            <div className="flex flex-row items-center justify-start gap-1">
                <SidebarTrigger />
                <h1 className="text-[14px] font-rethink font-semibold whitespace-nowrap truncate">{org.toLowerCase()}</h1>
                <span className="text-[14px] font-rethink text-black">/</span>
                <Link href={pathname} className="text-[14px] font-rethink font-semibold line-clamp-1">{pathSegments}</Link>
            </div>
            <button type="button" onClick={toggle} className="flex flex-row items-center text-[12px] font-rethink font-semibold text-[#575757] cursor-pointer border-[1.5px] border-[#f2f2f2] rounded-[8px] px-[10px] py-[2px] w-fit whitespace-nowrap">
                <span>{isOpen ? "Hide AI" : "Use AI"}</span>
                <Image src={ai} alt="AI icon" width={12} height={12} className="ml-[5px]" />
            </button>
        </div>
    )
}