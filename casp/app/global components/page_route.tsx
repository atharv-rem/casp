"use client";

import workplace from "@/public/assets/building.svg";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function PageRoute({ org }: { org: string }) {
    const pathname = usePathname();
    const pathSegments = pathname.split("/").filter(Boolean).map(segment => segment.replace(/_/g, " ")).join(" / ");
    console.log("Path Segments:", pathSegments);
    return (
        <div className="flex flex-row items-center justify-start gap-1">
            <SidebarTrigger />
            <h1 className="text-[14px] font-rethink font-semibold">{org.toLowerCase()}</h1>
            <span className="text-[14px] font-rethink text-black">/</span>
            <Link href={pathname} className="text-[14px] font-rethink font-semibold">{pathSegments}</Link>
        </div>
    )
}