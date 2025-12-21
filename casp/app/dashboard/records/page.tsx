import Image from "next/image";
import addfile from "@/public/assets/add file.svg"
import AddBulkRecordButton from "@/app/components/add bulk record button";
import AddSingleRecordButton from "@/app/components/add single record";

export default function RecordsPage() {
    return (
        <div className="flex flex-col items-start justify-start w-full h-full px-[20px]">
            <h1 className="text-[25px] font-cal mt-[10px]">Add New Record</h1>
            <div className="flex flex-row mt-[5px]">
                <AddSingleRecordButton />
                <AddBulkRecordButton />
            </div>
        </div>
    );
}