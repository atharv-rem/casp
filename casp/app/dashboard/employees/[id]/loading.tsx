import { Skeleton } from "@/components/ui/skeleton";

export default function loading() {
  return (
    <div className="max-w-xl mx-auto border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <Skeleton className="h-32 w-full rounded-none" />
      <div className="px-4 pb-4 -mt-9">
        <Skeleton className="w-20 h-20 rounded-full border-4 border-white" />
        <div className="mt-3 flex flex-col gap-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
          <div className="flex gap-4 mt-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}