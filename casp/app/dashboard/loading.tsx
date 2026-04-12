import UnicodeSpinner from "@/app/global components/unicode_spinner"
import { TextShimmer } from "@/components/ui/shimmer"

export default function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex items-center gap-2">
        <UnicodeSpinner name="orbit" />
        <TextShimmer
          className="font-rethink text-sm font-medium text-gray-500"
          colors={["transparent", "rgb(150, 150, 150)", "transparent"]}
        >
          Launching your dashboard...
        </TextShimmer>
      </div>
    </div>
  )
}