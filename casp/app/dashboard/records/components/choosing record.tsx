'use client';
import { useState } from "react";
import AddSingleRecord from "@/app/dashboard/records/components/add single record";
import AddBulkRecords from "@/app/dashboard/records/components/add bulk records";
export function ChoosingRecords( {orgId, empfields, projfields, projectList }: {orgId: string, empfields: any[], projfields: any[], projectList: any[]}) {
    const [numberOfRecords, setNumberOfRecords] = useState('single');
    return (
        <>
        <div className="mb-[20px] flex flex-row ">
            <button className={`text-[15px] mr-[10px] px-[15px] py-[5px] rounded-[12px] font-geist font-bold ${numberOfRecords === 'single' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`} onClick={() => setNumberOfRecords('single')}>
                SINGLE RECORD
            </button>
            <button className={`text-[15px] px-[15px] py-[5px] rounded-[12px] font-geist font-bold ${numberOfRecords === 'bulk' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`} onClick={() => setNumberOfRecords('bulk')}>
                BULK RECORDS
            </button>
        </div>
        {numberOfRecords === 'single' ? <AddSingleRecord orgId={orgId} empfields={empfields} projfields={projfields} projectList={projectList} /> : <AddBulkRecords empfields={empfields} projfields={projfields} />}
        </>
    );
}