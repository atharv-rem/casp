import {Skeleton} from "@/components/ui/skeleton"
export default function Loading() {
  return (
    <div className="w-1/2 h-dvh flex flex-col items-center justify-center pl-[30px] pr-[30px] pt-[20px]">
      <Skeleton className="h-[32px] w-1/2 mb-4" />
      <Skeleton className="h-[24px] w-1/2 mb-2" />
      <Skeleton className="h-[24px] w-1/2 mb-2" />
      <Skeleton className="h-[24px] w-1/2 mb-2" />
      <Skeleton className="h-[24px] w-1/2 mb-2" />
      <Skeleton className="h-[24px] w-1/2 mb-2" />
    </div>
);
}