"use client";

import workplace from "@/public/assets/building.svg";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function PageRoute({ org }: { org: string }) {
    const pathname = usePathname();
    const pathSegments = pathname.split("/").filter(Boolean).map(segment => segment.replace(/_/g, " ")).join(" / ");
    
    return (
        <div className="flex flex-row items-center justify-start gap-1">
            <Image src={workplace} alt="workplace Logo" width={14} height={14} />
            <h1 className="text-[14px] font-rethink font-semibold">{org.toLowerCase()}</h1>
            <span className="text-[14px] font-rethink text-black">/</span>
            <Link href={pathname} className="text-[14px] font-rethink font-semibold">{pathSegments}</Link>
        </div>
    )
}