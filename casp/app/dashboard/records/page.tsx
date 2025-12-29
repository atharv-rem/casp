import AddSingleRecord from "@/app/dashboard/records/components/add single record";
import AddBulkRecords from "@/app/dashboard/records/components/add bulk records";

export default function RecordsPage() {
    return (
        <div className="w-full items-start justify-center flex flex-row">
                <AddSingleRecord />
                <AddBulkRecords />
            </div>
    );
}