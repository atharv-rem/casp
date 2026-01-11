'use client';
import { useState } from "react";
import AddSingleRecord from "@/app/dashboard/add_records/components/add single record";
import AddBulkRecords from "@/app/dashboard/add_records/components/add bulk records";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
export function ChoosingRecords( {orgId, empfields, projfields, projectList }: {orgId: string, empfields: any[], projfields: any[], projectList: any[]}) {
    const [numberOfRecords, setNumberOfRecords] = useState('single');
    return (
        <>
        <Tabs defaultValue="single record" className="w-full">
            <TabsList>
                <TabsTrigger value="single record" onClick={() => setNumberOfRecords('single')} className="w-full font-rethink font-bold">Single Record</TabsTrigger>
                <TabsTrigger value="bulk records" onClick={() => setNumberOfRecords('bulk')} className="w-full font-rethink font-bold">Bulk Records</TabsTrigger>
            </TabsList>
            <TabsContent value="single record"></TabsContent>
            <TabsContent value="bulk records"></TabsContent>
        </Tabs>
        {numberOfRecords === 'single' ? <AddSingleRecord orgId={orgId} empfields={empfields} projfields={projfields} projectList={projectList} /> : <AddBulkRecords empfields={empfields} projfields={projfields} />}
        </>
    );
}