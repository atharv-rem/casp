import Image from "next/image";
import addfile from "@/public/assets/add file.svg"
import AddBulkRecordButton from "@/app/components/add bulk record button";
import AddSingleRecordButton from "@/app/components/add single record";

export default function RecordsPage() {
    return (
        <div className="w-full items-start justify-center flex flex-col">
                <AddSingleRecordButton />
            </div>
    );
}